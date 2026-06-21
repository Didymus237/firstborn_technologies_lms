import type { Request, Response } from "express";
import Attendance from "../models/attendance";
import { logActivity } from "../utils/activitieslog";

// @desc    Mark or Update attendance for a class
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { classId, subjectId, date, records } = req.body;
        const user = (req as any).user;
        const teacherId = user.role === 'teacher' ? user._id || user.id : req.body.teacherId || (user._id || user.id);

        if (!subjectId) {
            return res.status(400).json({ message: "subjectId is required" });
        }

        // Normalize date to start of the day to ensure unique record per day
        const attendanceDate = new Date(date || Date.now());
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ classId, subjectId, date: attendanceDate });

        if (attendance) {
            // Update existing attendance
            attendance.records = records;
            attendance.markedBy = user._id || user.id;
            attendance.teacherId = teacherId;
            await attendance.save();
            
            await logActivity({
                userId: user._id || user.id,
                action: "Updated Attendance",
                details: `For class ${classId} on ${attendanceDate.toDateString()}`
            });
        } else {
            // Create new attendance
            attendance = await Attendance.create({
                classId,
                subjectId,
                date: attendanceDate,
                records,
                markedBy: user._id || user.id,
                teacherId
            });
            
            await logActivity({
                userId: user._id || user.id,
                action: "Marked Attendance",
                details: `For class ${classId} on ${attendanceDate.toDateString()}`
            });
        }

        res.status(200).json({ message: "Attendance saved successfully", attendance });
    } catch (error: any) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Server error marking attendance", error: error.message });
    }
};

// @desc    Get attendance for a specific class and date
// @route   GET /api/attendance/class/:classId
// @access  Private
export const getAttendanceByClass = async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const { date, subjectId } = req.query;

        let query: any = { classId };

        if (subjectId) {
            query.subjectId = subjectId;
        }

        if (date) {
            const queryDate = new Date(date as string);
            queryDate.setHours(0, 0, 0, 0);
            query.date = queryDate;
        }

        const attendance = await Attendance.find(query)
            .populate("records.student", "name email enrollmentNumber profilePic")
            .populate("markedBy", "name")
            .populate("subjectId", "name code")
            .sort({ date: -1 });

        res.status(200).json(attendance);
    } catch (error: any) {
        console.error("Error fetching class attendance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get attendance history for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendance = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const { classId } = req.query;
        const user = (req as any).user;

        // RBAC: Students can only view their own history
        if (user.role === "student" && user._id.toString() !== studentId) {
            return res.status(403).json({ message: "Not authorized to view other students' attendance" });
        }

        let query: any = { "records.student": studentId };
        
        if (classId) {
            query.classId = classId;
        }

        const attendance = await Attendance.find(query)
            .populate("classId", "name grade section")
            .populate("subjectId", "name code")
            .populate("markedBy", "name")
            .sort({ date: -1 });

        // Filter out other students' records from the response to save bandwidth
        const studentRecords = attendance.map(att => {
            const record = att.records.find(r => r.student.toString() === studentId);
            return {
                id: att._id,
                class: att.classId,
                subject: att.subjectId,
                date: att.date,
                markedBy: att.markedBy,
                status: record?.status,
                remarks: record?.remarks
            };
        });

        res.status(200).json(studentRecords);
    } catch (error: any) {
        console.error("Error fetching student attendance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get subject-wise attendance analytics for a student
// @route   GET /api/attendance/analytics/:studentId
// @access  Private
export const getAttendanceAnalytics = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const user = (req as any).user;

        // RBAC: Students can only see their own
        if (user.role === 'student' && user._id.toString() !== studentId) {
            return res.status(403).json({ message: "Not authorized to view other students' attendance" });
        }

        const attendance = await Attendance.find({ "records.student": studentId })
            .populate("subjectId", "name code")
            .sort({ date: 1 });

        const stats: any = {};

        attendance.forEach(att => {
            if (!att.subjectId) return; // Critical guard for deleted or missing templates
            
            const subId = (att.subjectId as any)._id.toString();
            const subName = (att.subjectId as any).name;
            const subCode = (att.subjectId as any).code;

            if (!stats[subId]) {
                stats[subId] = {
                    subjectId: subId,
                    subjectName: subName,
                    subjectCode: subCode,
                    totalClasses: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                };
            }

            const record = att.records.find(r => r.student.toString() === studentId);
            if (record) {
                stats[subId].totalClasses += 1;
                if (record.status === 'Present') stats[subId].present += 1;
                else if (record.status === 'Absent') stats[subId].absent += 1;
                else if (record.status === 'Late') stats[subId].late += 1;
                else if (record.status === 'Excused') stats[subId].excused += 1;
            }
        });

        // Calculate percentages
        const result = Object.values(stats).map((s: any) => ({
            ...s,
            percentage: s.totalClasses > 0 ? ((s.present + (s.late * 0.5)) / s.totalClasses) * 100 : 0
        }));

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching attendance analytics:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get attendance summary for a teacher
// @route   GET /api/attendance/teacher/summary
// @access  Private (Teacher/Admin)
export const getTeacherAttendanceSummary = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const teacherId = user._id || user.id;

        const attendance = await Attendance.find({ teacherId })
            .populate("classId", "name grade section")
            .populate("subjectId", "name code")
            .sort({ date: -1 });

        res.status(200).json(attendance);
    } catch (error: any) {
        console.error("Error fetching teacher attendance summary:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get global attendance reports for admin
// @route   GET /api/attendance/admin/reports
// @access  Private (Admin)
export const getAdminAttendanceReports = async (req: Request, res: Response) => {
    try {
        const { studentId, subjectId, classId, startDate, endDate } = req.query;

        let query: any = {};

        if (studentId) query["records.student"] = studentId;
        if (subjectId) query.subjectId = subjectId;
        if (classId) query.classId = classId;
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        const reports = await Attendance.find(query)
            .populate("classId", "name grade section")
            .populate("subjectId", "name code")
            .populate("markedBy", "name")
            .populate("records.student", "name rollNumber")
            .sort({ date: -1 })
            .limit(100);

        res.status(200).json(reports);
    } catch (error: any) {
        console.error("Error fetching admin reports:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
