import { type Request, type Response } from "express";
import { logActivity } from "../utils/activitieslog";
import Assignment from "../models/assignment";
import AssignmentSubmission from "../models/assignmentSubmission";
import Class from "../models/class";

//@desc Create new Assignment
//@route POST /api/assignments
//@access Private (teacher, admin)
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, class: classId, subject, dueDate, points, attachments } = req.body;
        const teacherId = (req as any).user?._id;

        const assignment = await Assignment.create({
            title,
            description,
            class: classId,
            subject,
            teacher: teacherId,
            dueDate,
            points: points || 100,
            attachments: attachments || [],
            isActive: true,
        });

        await logActivity({
            userId: teacherId,
            action: `Created assignment: ${title}`
        });

        res.status(201).json({ message: "Assignment created successfully", assignment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

//@desc Get Assignments
//@route GET /api/assignments
//@access Private
export const getAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        let query = {};

        if (user.role === "student") {
            query = { class: user.studentClass, isActive: true };
        } else if (user.role === "teacher") {
            query = { teacher: user._id };
        }

        const assignments = await Assignment.find(query)
            .populate("subject", "name config")
            .populate("class", "name section")
            .sort({ createdAt: -1 });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

//@desc Get Assignment By ID
//@route GET /api/assignments/:id
//@access Private
export const getAssignmentById = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const user = (req as any).user;

        const assignment = await Assignment.findById(assignmentId)
            .populate("subject", "name")
            .populate("class", "name section")
            .populate("teacher", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Security Validation
        if (user.role === "student") {
            if (!assignment.isActive) {
                return res.status(403).json({ message: "Assignment is not active" });
            }
            const assignClassId = (assignment.class as any)._id ? (assignment.class as any)._id.toString() : assignment.class.toString();
            if (String(user.studentClass) !== assignClassId) {
                return res.status(403).json({ message: "Not authorized to access this assignment" });
            }
        }

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

//@desc Delete Assignment
//@route DELETE /api/assignments/:id
//@access Private (teacher, admin)
export const deleteAssignment = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        await AssignmentSubmission.deleteMany({ assignment: assignmentId });
        await Assignment.findByIdAndDelete(assignmentId);

        res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

//@desc Submit Assignment (Student)
//@route POST /api/assignments/:id/submit
//@access Private (student)
export const submitAssignment = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const studentId = (req as any).user?._id;
        const { content, attachments } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || !assignment.isActive) {
            return res.status(404).json({ message: "Assignment not available" });
        }

        const existing = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });
        if (existing) {
            return res.status(400).json({ message: "You have already submitted this assignment" });
        }

        // Determine if late
        const isLate = new Date() > new Date(assignment.dueDate);

        const submission = await AssignmentSubmission.create({
            assignment: assignmentId,
            student: studentId,
            content,
            attachments: attachments || [],
            status: isLate ? "late" : "submitted"
        });

        res.status(201).json({ message: "Submitted successfully", submission });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

//@desc Grade Assignment (Teacher)
//@route PUT /api/assignments/:id/grade/:studentId
//@access Private (teacher, admin)
export const gradeAssignment = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const studentId = req.params.studentId as string;
        const { score, feedback } = req.body;

        const submission = await AssignmentSubmission.findOneAndUpdate(
            { assignment: assignmentId, student: studentId },
            { score, feedback, status: "graded" },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.status(200).json({ message: "Graded successfully", submission });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

//@desc Get Student Submission
//@route GET /api/assignments/:id/submission
//@access Private (student)
export const getMySubmission = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const studentId = (req as any).user?._id;

        const submission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });
        res.status(200).json(submission || null);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

//@desc Get All Submissions for Assignment
//@route GET /api/assignments/:id/submissions
//@access Private (teacher, admin)
export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const assignmentId = req.params.id as string;
        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .populate("student", "name email");

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
