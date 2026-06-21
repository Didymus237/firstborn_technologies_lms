import { type Request, type Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import Leave from '../models/leave';

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Teacher)
export const createLeave = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            teacherId: req.user!._id,
            leaveType,
            startDate,
            endDate,
            reason
        });

        res.status(201).json(leave);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get leave applications
// @route   GET /api/leaves
// @access  Private
export const getLeaves = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let query = {};
        
        // Teachers only see their own leaves
        if (req.user?.role === 'teacher') {
            query = { teacherId: req.user?._id };
        } 
        // Admin sees all leaves

        const leaves = await Leave.find(query)
            .populate('teacherId', 'name department email')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin)
export const updateLeaveStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status, remarks } = req.body;
        
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        leave.status = status;
        if (remarks) leave.remarks = remarks;

        await leave.save();
        res.json(leave);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Cancel a pending leave
// @route   DELETE /api/leaves/:id
// @access  Private (Teacher)
export const cancelLeave = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        if (leave.teacherId.toString() !== req.user?._id?.toString()) {
             return res.status(403).json({ message: 'Not authorized to cancel this leave' });
        }

        if (leave.status !== 'Pending') {
             return res.status(400).json({ message: 'Cannot cancel an application that has already been processed.' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave application canceled' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
