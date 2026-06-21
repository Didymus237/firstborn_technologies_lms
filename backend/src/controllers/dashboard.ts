import { type Request, type Response } from "express"
import { logActivity } from "../utils/activitieslog";
import Class from "../models/class";
import Exam from "../models/exams";
import Submission from "../models/submissions";
import Subject from "../models/subject";
import User from "../models/user";
import ActivityLog from "../models/activitieslog";
import Attendance from "../models/attendance";
import Receipt from "../models/receipt";
import Leave from "../models/leave";
import Complaint from "../models/complaint";
import FeeInvoice from "../models/feeInvoice";
import { Types } from "mongoose";



//helper to get day name (e.g "Monday")
const getTodayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}
//@desc get dashboard data
//@route GET /api/dashboard
//@access Private (admin only)

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let stats = {};

        //Get the 5 activities system-wide (Admin) or personal (others)
        const activityQuery = user.role === "admin" ? {} : { user: user.id };
        const recentActivities = await ActivityLog.find(activityQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name ");
        const formattedActivity = recentActivities.map(activity => (
            `${(activity.user as any).name} : ${activity.action} (${new Date(activity.createdAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        ));
        if (user.role === "admin") {
            const totalStudents = await User.countDocuments({ role: "student" });
            const totalTeachers = await User.countDocuments({ role: "teacher" });
            const activeExams = await Exam.countDocuments({ isActive: true });

            // Marking Attendance logic
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const attendancesToday = await Attendance.find({ date: today });

            let totalStudentsPresent = 0;
            attendancesToday.forEach(att => {
                totalStudentsPresent += att.records.filter(r => r.status === 'Present').length;
            });

            // --- Phase 7 Analytics Aggregations ---
            const totalClasses = await Class.countDocuments();
            const totalSubjects = await Subject.countDocuments();

            const systemOverview = [
                { name: 'Students', value: totalStudents },
                { name: 'Teachers', value: totalTeachers },
                { name: 'Admins', value: await User.countDocuments({ role: 'admin' }) }
            ];

            const attendanceTrends = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);

                const dayAttendances = await Attendance.find({ date: d });
                let pres = 0;
                let abs = 0;

                dayAttendances.forEach(att => {
                    pres += att.records.filter(r => r.status === 'Present').length;
                    abs += att.records.filter(r => r.status === 'Absent').length;
                });

                attendanceTrends.push({
                    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    present: pres,
                    absent: abs
                });
            }

            // --- Advanced Operational & Financial Analytics ---
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [
                verifiedReceipts,
                pendingInvoices,
                pendingLeaves,
                pendingComplaints,
                criticalComplaints,
                newStudents
            ] = await Promise.all([
                Receipt.find({ status: 'Verified' }),
                FeeInvoice.find({ status: 'pending' }),
                Leave.countDocuments({ status: 'Pending' }),
                Complaint.countDocuments({ status: 'Submitted' }),
                Complaint.countDocuments({ aiSeverity: 'Critical', status: { $ne: 'Resolved' } }),
                User.countDocuments({ role: 'student', createdAt: { $gte: thirtyDaysAgo } })
            ]);

            const totalRevenue = verifiedReceipts.reduce((acc, r) => acc + r.amount, 0);
            const totalOutstanding = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
            
            const onlineRevenue = verifiedReceipts.filter(r => r.paymentMode === 'Online').reduce((acc, r) => acc + r.amount, 0);
            const cashRevenue = totalRevenue - onlineRevenue;

            stats = {
                totalStudents,
                totalTeachers,
                activeExams,
                totalStudentsPresent,
                systemOverview,
                attendanceTrends,
                academicMetrics: {
                    classes: totalClasses,
                    subjects: totalSubjects,
                    exams: activeExams
                },
                financialMetrics: {
                    totalRevenue,
                    totalOutstanding,
                    onlineRevenue,
                    cashRevenue
                },
                operationalMetrics: {
                    pendingLeaves,
                    pendingComplaints,
                    criticalComplaints,
                    newStudentsLast30Days: newStudents
                }
            };
        }
        else if (user.role === "teacher") {
            // General Stats
            const totalStudents = await User.countDocuments({ role: "student" });
            const totalTeachers = await User.countDocuments({ role: "teacher" });
            const activeExams = await Exam.countDocuments({ isActive: true });

            // Marking Attendance logic for teacher's classes
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get classes where this user is the teacher
            const myClasses = await Class.find({ classTeacher: user._id });
            const myClassIds = myClasses.map(c => c._id);

            const attendancesToday = await Attendance.find({ 
                classId: { $in: myClassIds }, 
                date: today 
            });

            let totalStudentsPresent = 0;
            attendancesToday.forEach(att => {
                totalStudentsPresent += att.records.filter(r => r.status === 'Present').length;
            });

            const myClassesCount = myClassIds.length;
            const nextClass = "Not available yet";
            const nextClassTime = "Not available yet";
            const pendingGrading = 0;

            stats = {
                totalStudents,
                totalTeachers,
                activeExams,
                totalStudentsPresent,
                myClassesCount,
                pendingGrading,
                nextClass,
                nextClassTime,
            }
        }
        else if (user.role === "student") {
            const nextExam = await Exam.find({ class: user.studentClass }).sort({ dueDate: 1 }).limit(1);
            const pendingAssignments = await Exam.countDocuments({ class: user.studentClass, dueDate: { $gte: new Date() } });

            // Calculate Overall Attendance Percentage
            const studentIdStr = user._id ? user._id.toString() : user.id.toString();
            const allAttendance = await Attendance.find({ "records.student": studentIdStr });
            
            let totalClasses = 0;
            let attendancePoints = 0;

            allAttendance.forEach(att => {
                const record = att.records.find(r => r.student.toString() === studentIdStr);
                if (record) {
                    totalClasses++;
                    if (record.status === 'Present') attendancePoints += 1;
                    else if (record.status === 'Late') attendancePoints += 0.5;
                }
            });

            const attendancePercentage = totalClasses > 0 ? ((attendancePoints / totalClasses) * 100).toFixed(1) + "%" : "0%";

            stats = {
                myAttendance: attendancePercentage,
                nextExam: nextExam[0]?.title || "None",
                pendingAssignments,
                nextExamDate: nextExam[0]?.dueDate,
                recentActivities: formattedActivity
            }
        }

        res.status(200).json({
            stats,
            recentActivities: formattedActivity
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
