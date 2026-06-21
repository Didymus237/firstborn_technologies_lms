import { type Request, type Response} from "express";
import AcademicYear from "../models/academicYear";
import { logActivity } from "../utils/activitieslog";
import mongoose from 'mongoose';

// @desc    Get current academic year
// @route   Post /api/academic-years/create
// @access  Private (admin only)


export const createAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, fromYear, toYear, isCurrent } = req.body;
        const existingYear = await AcademicYear.findOne({ fromYear: new Date(fromYear), toYear: new Date(toYear) });
        if (existingYear) {
            res.status(400).json({ message: 'Academic year already exists for the given range' });
            return;
        }

        // if iscurrent is true, set all other academic years to false
        if (isCurrent) {
            await AcademicYear.updateMany({ iscurrent: true }, { iscurrent: false });
        }
        const academicYear = await AcademicYear.create({
             name, 
             fromYear: new Date(fromYear), 
             toYear: new Date(toYear), 
             iscurrent: isCurrent || false
            
        });
        await logActivity({
          userId: (req as any).user._id,
          action: `Created academic year: ${name}`,
          details: `Academic year created from ${fromYear} to ${toYear}`
        });
        res.status(201).json(academicYear);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

// @desc    Get all academic years
// @route   GET /api/academic-years
// @access  Private (admin only)

export const getAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const academicYears = await AcademicYear.find().sort({ createdAt: -1 });
        res.json(academicYears);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Get all academic years (paginated and searchable)
// @route   GET /api/academic-years
// @access  Private (admin only)

export const getAcademicYears = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { fromYear: { $regex: search, $options: 'i' } },
                { toYear: { $regex: search, $options: 'i' } }
            ];
        }
        const academicYears = await AcademicYear.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
        const total = await AcademicYear.countDocuments(query);
        res.json({ academicYears, total, page, limit });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current active academic year
// @route   GET /api/academic-years/current
// @access  Public or protected (based on your requirements)

export const getCurrentAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        let currentYear = await AcademicYear.findOne({ iscurrent: true });

        // Fallback: If none marked as 'current', get the most recent one to prevent app crash
        if (!currentYear) {
            currentYear = await AcademicYear.findOne().sort({ createdAt: -1 });
        }

        if (!currentYear) {
            res.status(404).json({ message: 'No academic years structurally located in database' });
            return;
        }
        res.json(currentYear);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Update academic year
// @route   PUT /api/academic-years/:id
// @access  Private (admin only)

export const updateAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, fromYear, toYear, isCurrent } = req.body;

        const academicYear = await AcademicYear.findById(id);
        if (!academicYear) {
            res.status(404).json({ message: 'Academic year not found' });
            return;
        }

        // if iscurrent is true, set all other academic years to false
        if (isCurrent) {
            await AcademicYear.updateMany({ iscurrent: true }, { iscurrent: false });
        }

        academicYear.name = name || academicYear.name;
        academicYear.fromYear = fromYear ? new Date(fromYear) : academicYear.fromYear;
        academicYear.toYear = toYear ? new Date(toYear) : academicYear.toYear;
        academicYear.iscurrent = isCurrent !== undefined ? isCurrent : academicYear.iscurrent;

        const updatedYear = await academicYear.save();
        await logActivity({
          userId: (req as any).user._id,
          action: `Updated academic year: ${academicYear.name}`,
          details: `Academic year updated to ${academicYear.name} from ${academicYear.fromYear} to ${academicYear.toYear}`
        });
        res.json(updatedYear);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Delete academic year
// @route   DELETE /api/academic-years/:id
// @access  Private (admin only)

export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const academicYear = await AcademicYear.findById(id);
        if (!academicYear) {
            res.status(404).json({ message: 'Academic year not found' });
            return;
        }
        if (academicYear.iscurrent) {
            res.status(400).json({ message: 'Cannot delete the current active academic year' });
            return;
        }
        await AcademicYear.deleteOne({ _id: academicYear._id });
        await logActivity({
          userId: (req as any).user._id,
          action: `Deleted academic year: ${academicYear.name}`,
          details: `Academic year deleted with name ${academicYear.name} from ${academicYear.fromYear} to ${academicYear.toYear}`
        });
        res.json({ message: 'Academic year deleted' });
    } catch (error) {
        console.error(error);
            res.status(500).json({ message: 'Server error' });
        }               
    }