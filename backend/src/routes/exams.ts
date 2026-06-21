import express from "express";

import {
    triggerExamGeneration,
    toggleExamStatus,
    getExamResults,
    submitExam,
    getExamById,
    getExams,
    deleteExam,
    // createExam, 
    //updateExam, 
}
    from "../controllers/exam";
import { protect, authorize } from "../middleware/auth";

const examsRouter = express.Router();

examsRouter.get("/", protect, getExams);

examsRouter.post("/generate", protect, authorize(["admin", "teacher"]), triggerExamGeneration);
examsRouter.get("/:id", protect, getExamById);
examsRouter.post("/:id/submit", protect, authorize(["student"]), submitExam);
examsRouter.put("/:id/status", protect, authorize(["admin", "teacher"]), toggleExamStatus);
examsRouter.get("/:id/results", protect, getExamResults);
examsRouter.delete("/:id", protect, authorize(["admin", "teacher"]), deleteExam);

export default examsRouter;