import express from "express";
import {
    createAssignment,
    getAssignments,
    getAssignmentById,
    deleteAssignment,
    submitAssignment,
    gradeAssignment,
    getMySubmission,
    getAssignmentSubmissions
} from "../controllers/assignment";
import { protect, authorize } from "../middleware/auth";

const assignmentsRouter = express.Router();

assignmentsRouter.post("/", protect, authorize(["admin", "teacher"]), createAssignment);
assignmentsRouter.get("/", protect, getAssignments);
assignmentsRouter.get("/:id", protect, getAssignmentById);
assignmentsRouter.delete("/:id", protect, authorize(["admin", "teacher"]), deleteAssignment);

assignmentsRouter.post("/:id/submit", protect, authorize(["student"]), submitAssignment);
assignmentsRouter.get("/:id/submission", protect, authorize(["student"]), getMySubmission);

assignmentsRouter.put("/:id/grade/:studentId", protect, authorize(["admin", "teacher"]), gradeAssignment);
assignmentsRouter.get("/:id/submissions", protect, authorize(["admin", "teacher"]), getAssignmentSubmissions);

export default assignmentsRouter;
