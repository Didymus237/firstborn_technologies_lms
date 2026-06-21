import express from "express";
import { generateTimetable, getTimetableByClass, updateTimetable, getTimetableByTeacher, checkConflict } from "../controllers/timetable";
import { protect, authorize } from "../middleware/auth";


const timetableRouter = express.Router();

timetableRouter.post("/generate", protect, authorize(["admin"]), generateTimetable);
timetableRouter.post("/check-conflict", protect, authorize(["admin"]), checkConflict);

//viewed by everyone students need to view the timetable for their class and academic year
timetableRouter.get("/:classId", protect, getTimetableByClass);
timetableRouter.get("/teacher/:teacherId", protect, getTimetableByTeacher);
timetableRouter.put("/:classId", protect, authorize(["admin"]), updateTimetable);

export default timetableRouter;