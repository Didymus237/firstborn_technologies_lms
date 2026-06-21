import { type Request, type Response} from "express"
import { logActivity } from "../utils/activitieslog";
import { inngest } from "../inngest";
import Timetable from "../models/timetable";
import AcademicYear from "../models/academicYear";


// @desc generate timetable using AI
// @route POST /api/timetable/generate
// @access Private (admin only)

export const generateTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId , academicYear, settings} = req.body;
        await inngest.send({
          name: "app/generate.timetable",
          data: {
            classId,
            academicYear,
            settings
          },
        });
        res.status(200).json({ message: 'Timetable generation requested successfully' });
        const userId = (req as any).user?._id;
               await logActivity({ userId, action: `Requested timetable generation for class ${classId} in academic year ${academicYear}` });
        // Trigger the Inngest function to generate the timetable
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        
    }
}

// @desc Get timetable by class and academic year
// @route GET /api/timetable/:classId
// @access Private (admin only)
// @query academicYear (required)

export const getTimetableByClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId } = req.params;
        const { academicYear } = req.query;

        if (!classId) {
            res.status(400).json({ message: "classId is required" });
            return;
        }

        let timetable;

        if (academicYear && typeof academicYear === "string") {
            timetable = await Timetable.findOne({
                class: classId,
                academicYear,
            })
                .sort({ createdAt: -1 }) // Handle potential duplicates gracefully
                .populate("class")
                .populate("schedule.periods.subject")
                .populate({
                  path: "schedule.periods.teacher",
                  select: "name email phone role"
                });
        } else {
            // If academicYear is not provided, try to find the current one first
            let currentYear = await AcademicYear.findOne({ iscurrent: true });
            if (!currentYear) {
                currentYear = await AcademicYear.findOne().sort({ createdAt: -1 });
            }

            if (currentYear) {
                timetable = await Timetable.findOne({ 
                    class: classId, 
                    academicYear: currentYear._id.toString() 
                })
                    .sort({ createdAt: -1 })
                    .populate("class")
                    .populate("schedule.periods.subject")
                    .populate({
                      path: "schedule.periods.teacher",
                      select: "name email phone role"
                    });
            }

            // Fallback to the absolute latest for this class regardless of year
            if (!timetable) {
                timetable = await Timetable.findOne({ class: classId })
                    .sort({ createdAt: -1 })
                    .populate("class")
                    .populate("schedule.periods.subject")
                    .populate({
                      path: "schedule.periods.teacher",
                      select: "name email phone role"
                    });
            }
        }

        if (!timetable) {
            res.status(404).json({
                message: "Timetable not found for the specified class and academic year",
            });
            return;
        }

        res.status(200).json(timetable);
    } catch (error) {
        console.error("❌ Error fetching timetable:", error);
        res.status(500).json({ message: "Error fetching timetable" });
    }
}

// @desc Update/Create manual timetable
// @route PUT /api/timetables/:classId
// @access Private (admin only)

export const updateTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId } = req.params;
        const { academicYear, schedule } = req.body;

        if (!classId || !academicYear || !schedule) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        // Optional: Perform conflict checks here for every period in the incoming schedule
        // For now, we'll allow the save and perhaps add a separate validation API for the frontend

        const timetable = await Timetable.findOneAndUpdate(
            { class: classId, academicYear },
            { class: classId, academicYear, schedule },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Timetable updated successfully", timetable });
        
        const userId = (req as any).user?._id;
        await logActivity({ userId, action: `Updated timetable for class ${classId}` });
    } catch (error) {
        console.error("❌ Error updating timetable:", error);
        res.status(500).json({ message: "Error updating timetable" });
    }
}

// @desc Get teacher's personal schedule
// @route GET /api/timetables/teacher/:teacherId
// @access Private

export const getTimetableByTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.params;
        const { academicYear } = req.query;

        if (!teacherId || !academicYear) {
            res.status(400).json({ message: "teacherId and academicYear are required" });
            return;
        }

        // Find all timetables for this academic year and filter periods for this teacher
        const timetables = await Timetable.find({ academicYear })
            .populate("class")
            .populate("schedule.periods.subject");

        const teacherSchedule: any[] = [];

        // Transform into a teacher-centric view
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        days.forEach(day => {
            const periods: any[] = [];
            timetables.forEach(tt => {
                const daySchedule = tt.schedule.find(s => s.day === day);
                if (daySchedule) {
                    daySchedule.periods.forEach(p => {
                        if (p.teacher && p.teacher.toString() === teacherId) {
                            periods.push({
                                ...p.toObject(),
                                class: tt.class
                            });
                        }
                    });
                }
            });
            if (periods.length > 0) {
                teacherSchedule.push({ day, periods: periods.sort((a, b) => a.startTime.localeCompare(b.startTime)) });
            }
        });

        res.status(200).json(teacherSchedule);
    } catch (error) {
        console.error("❌ Error fetching teacher schedule:", error);
        res.status(500).json({ message: "Error fetching teacher schedule" });
    }
}

// @desc Check for conflicts
// @route POST /api/timetables/check-conflict
// @access Private (admin only)

export const checkConflict = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId, roomId, day, startTime, endTime, academicYear, excludeClassId } = req.body;

        const query: any = { academicYear };
        if (excludeClassId) {
            query.class = { $ne: excludeClassId };
        }

        const timetables = await Timetable.find(query);
        const conflicts: string[] = [];

        timetables.forEach(tt => {
            const daySchedule = tt.schedule.find(s => s.day === day);
            if (daySchedule) {
                daySchedule.periods.forEach(p => {
                    // Check time overlap
                    const isOverlap = (startTime < p.endTime && endTime > p.startTime);
                    if (isOverlap) {
                        if (teacherId && p.teacher && p.teacher.toString() === teacherId) {
                            conflicts.push(`Teacher is already assigned to class ${(tt as any).class?.name || tt.class} at this time.`);
                        }
                        if (roomId && p.room === roomId) {
                            conflicts.push(`Room ${roomId} is already occupied by class ${(tt as any).class?.name || tt.class} at this time.`);
                        }
                    }
                });
            }
        });

        res.status(200).json({ hasConflict: conflicts.length > 0, conflicts });
    } catch (error) {
        console.error("❌ Error checking conflict:", error);
        res.status(500).json({ message: "Error checking conflict" });
    }
}

//@desc generate exams using AI
//@route POST /api/exams/generate   
//@access Private (admin only)

