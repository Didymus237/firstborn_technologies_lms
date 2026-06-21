import { type Request, type Response} from "express"
import Class from "../models/class";
import User from "../models/user";
import Subject from "../models/subject";
import { logActivity } from "../utils/activitieslog";

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (admin only)

export const createClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, academicYear, classTeacher, capacity } = req.body;

        if (!name || !academicYear) {
            res.status(400).json({ message: 'name and academicYear are required' });
            return;
        }

        const existingClass = await Class.findOne({ name, academicYear });
        if (existingClass) {
            res.status(400).json({ message: 'Class already exists for the given name and academic year' });
            return;
        }

        const newClass = await Class.create({
             name,
             academicYear,
             classTeacher: classTeacher || null,
             capacity
        });

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('createClass: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Created new class: ${newClass.name}`
          });
        }

        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc update class details
//@route PUT /api/classes/:id
//@access Private (admin only)      

export const updateClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = req.params.id;
        const { name, academicYear, classTeacher, capacity, subjects } = req.body;

        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            res.status(404).json({ message: 'Class not found' });
            return;
        }

        // Ensure the update won't create a duplicate class for the same academic year
        if ((name || academicYear) && (name || existingClass.name) && (academicYear || existingClass.academicYear)) {
            const newName = name || existingClass.name;
            const newYear = academicYear || existingClass.academicYear;

            const dupeClass = await Class.findOne({
                _id: { $ne: existingClass._id },
                name: newName,
                academicYear: newYear
            });

            if (dupeClass) {
                res.status(400).json({ message: 'Another class with this name already exists in the same academic year' });
                return;
            }
        }

        if (name) existingClass.name = name;
        if (academicYear) existingClass.academicYear = academicYear as any;
        if (classTeacher !== undefined) existingClass.classTeacher = (classTeacher || null) as any;
        if (capacity !== undefined) existingClass.capacity = capacity;
        if (subjects !== undefined) existingClass.subjects = subjects as any;

        await existingClass.save();

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('updateClass: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Updated class: ${existingClass.name}`
          });
        }

        res.status(200).json(existingClass);    
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc delete class
//@route DELETE /api/classes/delete/:id
//@access Private (admin only)

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = req.params.id;

        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            res.status(404).json({ message: 'Class not found' });
            return;
        }

        await Class.findByIdAndDelete(classId);

        const userId = (req as any).user?._id;
        if (!userId) {
          console.warn('deleteClass: userId missing when logging activity');
        } else {
          await logActivity({
            userId,
            action: `Deleted class: ${existingClass.name}`
          });
        }

        res.status(200).json({ message: 'Class Removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc get all classes
//@route GET /api/classes
//@access Private (admin only)  

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
    try {
        //parse query params for pagination and filtering
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const user = (req as any).user;

        //build filter object for search(case insensitive search on class name)
        const query: any = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Apply strict teacher restriction
        if (user.role === 'teacher') {
            const assignedSubjects = await Subject.find({ teacher: user._id }).select('_id');
            const subjectIds = assignedSubjects.map(s => s._id);
            query.subjects = { $in: subjectIds };
        }

        //execcute query (count & find)
        const total = await Class.countDocuments(query);
        const classes = await Class.find(query)
            .populate('academicYear', 'name')
            .populate('classTeacher', 'name email')
            .populate('students', 'name email')
            .skip((page - 1) * limit)
            .limit(limit);

        // Dynamically fetch students for each class to ensure accurate counts
        const classesWithStudents = await Promise.all(classes.map(async (cls) => {
            const students = await User.find({ studentClass: cls._id, role: 'student' } as any).select('name email');
            const clsObj: any = cls.toObject();
            clsObj.students = students;
            return clsObj;
        }));

        //return response with pagination metadata
        res.status(200).json({
            data: classesWithStudents,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc get class by id
//@route GET /api/classes/:id
//@access Private (authenticated)

export const getClassById = async (req: Request, res: Response): Promise<void> => {
    try {
        const classId = req.params.id;
        const cls = await Class.findById(classId)
            .populate('academicYear', 'name')
            .populate('classTeacher', 'name email')
            .populate('subjects', 'name code');

        if (!cls) {
            res.status(404).json({ message: 'Class not found' });
            return;
        }

        // Dynamically fetch students assigned to this class
        const students = await User.find({ studentClass: classId, role: 'student' } as any).select('name email');
        
        const clsObj: any = cls.toObject();
        clsObj.students = students;

        res.status(200).json(clsObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}