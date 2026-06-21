import { type Request, type Response} from "express"
import { logActivity } from "../utils/activitieslog";
import Subject from "../models/subject";

//@dec create a new subject
//@route POST /api/subjects
//@access Private (admin only)

export const createSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, code, teacher, isActive } = req.body;
        const subjectExists = await Subject.findOne({ code });
        if (subjectExists) {
            res.status(400).json({ message: 'Subject with this code already exists' });
            return;
        }

        const newSubject = await Subject.create({
            name,
            code,
            teacher: Array.isArray(teacher) && teacher.length > 0 ? teacher[0] : null, // Handle both array and single value
            isActive: isActive !== undefined ? isActive : true
        });

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('createSubject: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Created new subject: ${newSubject.name}`
          });
        }

        res.status(201).json(newSubject);   
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc get all subjects
//@route GET /api/subjects
//@access Private (authenticated users)

export const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const query: any = {};
        if (user.role === 'teacher') {
            query.teacher = user._id; // strict restriction
        }
        const subjects = await Subject.find(query).populate('teacher', 'name email');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc update subject details
//@route PUT /api/subjects/:id
//@access Private (admin only)

export const updateSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const subjectId = req.params.id;
        const { name, code, teacher, isActive } = req.body;

        const existingSubject = await Subject.findById(subjectId);
        if (!existingSubject) {
            res.status(404).json({ message: 'Subject not found' });
            return;
        }

        // Check for duplicate code if code is being updated
        if (code && code !== existingSubject.code) {
            const codeExists = await Subject.findOne({ code });
            if (codeExists) {
                res.status(400).json({ message: 'Another subject with this code already exists' });
                return;
            }
        }

        existingSubject.name = name || existingSubject.name;
        existingSubject.code = code || existingSubject.code;
        existingSubject.teacher = Array.isArray(teacher) && teacher.length > 0 ? teacher[0] : (teacher || existingSubject.teacher);
        if (isActive !== undefined) existingSubject.isActive = isActive;

        await existingSubject.save();

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('updateSubject: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Updated subject: ${existingSubject.name}`
          });
        }

        res.status(200).json(existingSubject);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc delete a subject
//@route DELETE /api/subjects/:id
//@access Private (admin only)

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const subjectId = req.params.id;
        const existingSubject = await Subject.findById(subjectId);
        if (!existingSubject) {
            res.status(404).json({ message: 'Subject not found' });
            return;
        }

        await Subject.deleteOne({ _id: subjectId });

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('deleteSubject: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Deleted subject: ${existingSubject.name}`
          });
        }

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc assign subject to a class
//@route POST /api/subjects/:id/assign-class
//@access Private (admin only)

export const assignSubjectToClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const subjectId = req.params.id;
        const { classId } = req.body;

        const existingSubject = await Subject.findById(subjectId);
        if (!existingSubject) {
            res.status(404).json({ message: 'Subject not found' });
            return;
        }

        // Logic to assign subject to class goes here (e.g., update Class model to include this subject)

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('assignSubjectToClass: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Assigned subject ${existingSubject.name} to class with ID: ${classId}`
          });
        }

        res.status(200).json({ message: 'Subject assigned to class successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
