import express from "express";
import {
  addOrUpdateMarks,
  generateReportCard,
  getStudentReportCard,
  approveReportCard,
} from "../controllers/reportCard";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Admin/Teacher endpoints
router.post("/marks", protect, authorize(["admin", "teacher"]), addOrUpdateMarks);
router.post("/generate", protect, authorize(["admin", "teacher"]), generateReportCard);
router.put("/:id/approve", protect, authorize(["admin"]), approveReportCard);

// Student/Parent endpoints
router.get("/:studentId/:termId", protect, getStudentReportCard);

export default router;
