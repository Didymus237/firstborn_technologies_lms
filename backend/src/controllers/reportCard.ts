import type { Request, Response } from "express";
import Marks from "../models/marks";
import ReportCard from "../models/reportCard";
import Attendance from "../models/attendance";
import ExamTerm from "../models/examTerm";
import Subject from "../models/subject";

// Helper for Grade calculation
const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export const addOrUpdateMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, classId, examTerm, subject, maxMarks = 100, obtainedMarks, remarks } = req.body;

    // Validate Term Lock
    const term = await ExamTerm.findById(examTerm);
    if (!term) {
      res.status(404).json({ message: "Exam term not found" });
      return;
    }
    if (term.isLocked) {
      res.status(403).json({ message: "This exam term is locked. Marks cannot be edited." });
      return;
    }

    // Role-based Subject Constraint Mapping
    const user = (req as any).user;
    if (user.role === "teacher") {
      const subj = await Subject.findById(subject);
      if (!subj) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      if (subj.teacher?.toString() !== user._id.toString()) {
        res.status(403).json({ message: "Unauthorized. You are not assigned to this subject." });
        return;
      }
    }

    const percentage = (obtainedMarks / maxMarks) * 100;
    const grade = calculateGrade(percentage);

    const marksEntry = await Marks.findOneAndUpdate(
      { student, examTerm, subject },
      { class: classId, maxMarks, obtainedMarks, grade, remarks },
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.status(200).json({ message: "Marks saved successfully", marks: marksEntry });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to save marks", error: error.message });
  }
};

export const generateReportCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, classId, examTerm } = req.body;

    // Fetch all marks for this student and term
    const marksData = await Marks.find({ student, examTerm });
    
    if (!marksData || marksData.length === 0) {
      res.status(404).json({ message: "No marks found for this student and term." });
      return;
    }

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    const markIds = marksData.map((m) => {
      totalMaxMarks += m.maxMarks;
      totalObtainedMarks += m.obtainedMarks;
      return m._id;
    });

    const percentage = (totalObtainedMarks / totalMaxMarks) * 100;
    const finalGrade = calculateGrade(percentage);
    const status = percentage >= 50 ? "Pass" : "Fail";

    // Calculate approximate attendance
    // This looks for all attendance records where the user is listed.
    const attendanceRecords = await Attendance.find({ "records.student": student });
    let daysPresent = 0;
    let totalDays = 0;

    attendanceRecords.forEach((att) => {
      const studentRecord = att.records.find(r => r.student.toString() === student.toString());
      if (studentRecord) {
        totalDays++;
        if (studentRecord.status === "Present" || studentRecord.status === "Late") {
          daysPresent++;
        }
      }
    });

    const attendancePercentage = totalDays > 0 ? (daysPresent / totalDays) * 100 : 0;

    const reportCard = await ReportCard.findOneAndUpdate(
      { student, examTerm },
      {
        class: classId,
        marks: markIds,
        totalMaxMarks,
        totalObtainedMarks,
        percentage,
        finalGrade,
        status,
        attendancePercentage,
        isApproved: false,
      },
      { new: true, upsert: true }
    ).populate({
      path: "marks",
      populate: { path: "subject" }
    }).populate("student").populate("class").populate("examTerm");

    res.status(200).json({ message: "Report card generated successfully", reportCard });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to generate report card", error: error.message });
  }
};

export const getStudentReportCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, termId } = req.params;

    const reportCard = await ReportCard.findOne({ student: studentId, examTerm: termId })
      .populate({
        path: "marks",
        populate: { path: "subject", select: "name code" } // Only populate useful fields
      })
      .populate("student", "name rollNumber enrollmentNumber photoUrl studentClass")
      .populate("class", "name")
      .populate("examTerm", "name academicYear");

    if (!reportCard) {
      res.status(404).json({ message: "Report card not found" });
      return;
    }

    res.status(200).json({ reportCard });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch report card", error: error.message });
  }
};

export const approveReportCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teacherRemarks, principalRemarks } = req.body;

    const reportCard = await ReportCard.findByIdAndUpdate(
      id,
      { isApproved: true, teacherRemarks, principalRemarks },
      { new: true }
    );

    if (!reportCard) {
      res.status(404).json({ message: "Report card not found" });
      return;
    }

    res.status(200).json({ message: "Report card approved successfully", reportCard });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to approve report card", error: error.message });
  }
};
