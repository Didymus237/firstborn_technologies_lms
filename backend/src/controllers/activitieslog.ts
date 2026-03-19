import { type Request, type Response } from 'express';
import ActivitiesLog from '../models/activitieslog';

// @desc    Get all user activities
// @route   GET /api/activities
// @access  Private (authenticated users can view activities)

export const getAllActivities = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await ActivitiesLog.countDocuments();
        const logs = await ActivitiesLog.find()
            .populate('user', 'name email role') // Populate user details (name, email, role)
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limit);

        console.log('Logs found:', logs.length); // Debug log

        res.json({
            logs,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
}