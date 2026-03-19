import { type Request, type Response} from "express"
import Class from "../models/class";
import { logActivity } from "../utils/activitieslog";

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (admin only)

export const createClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, academicYear, classTeacher, capacity } = req.body;
        const existingClass = await Class.findOne({ name, academicYear });
        if (existingClass) {
            res.status(400).json({ message: 'Class already exists for the given name and academic year' });
            return;
        }

        const newClass = await Class.create({
             name, 
             academicYear, 
             classTeacher, 
             capacity
        });
        await logActivity({
          userId: ( req as any).user._id,
          action: `Created new class: ${newClass.name}`       
        });
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}