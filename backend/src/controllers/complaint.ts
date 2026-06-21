import { type Request, type Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import Complaint from '../models/complaint';
import mongoose from 'mongoose';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description, category, targetId, priority } = req.body;

        let aiInsights: any = {};
        try {
            const aiResponse = await generateObject({
                model: google('gemini-1.5-flash'),
                schema: z.object({
                    category: z.string(),
                    severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
                    priority_score: z.number().min(1).max(100),
                    suggested_action: z.string(),
                    suggested_reply: z.string(),
                    confidence_score: z.number().min(1).max(100)
                }),
                prompt: `You are an AI complaint analysis system for an educational institution.
Analyze the following student complaint and extract insights.

Complaint Title: ${title}
Complaint Description: ${description}

Return a formal, structured response providing a category mapping, an impact severity, a numerical priority score (1-100), a suggested administrative action, an immediately usable professional reply template targeting the student, and your confidence score.`
            });
            
            aiInsights = {
                aiCategory: aiResponse.object.category,
                aiSeverity: aiResponse.object.severity,
                aiPriorityScore: aiResponse.object.priority_score,
                aiSuggestedAction: aiResponse.object.suggested_action,
                aiSuggestedReply: aiResponse.object.suggested_reply,
                aiConfidenceScore: aiResponse.object.confidence_score
            };
        } catch (aiError) {
            console.error('Gemini AI Analysis Failed:', aiError);
            // Non-blocking: continue creating the complaint without AI if the model faults
        }

        const complaint = await Complaint.create({
            studentId: req.user!._id,
            targetId: targetId ? new mongoose.Types.ObjectId(targetId as string) : undefined,
            title,
            description,
            category,
            priority,
            ...aiInsights
        });

        res.status(201).json(complaint);
    } catch (error: any) {
        console.error("FATAL createComplaint ERROR:", error);
        res.status(400).json({ message: error.message || 'Server Error', details: error.stack });
    }
};

// @desc    Get complaints based on user role
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let query = {};
        
        if (req.user?.role === 'student') {
            query = { studentId: req.user._id };
        } else if (req.user?.role === 'teacher') {
            // Teachers see complaints assigned to them (targetId) OR unassigned 'Faculty' / 'Academic' complaints based on setup, 
            // but for tracking explicitly assigned is safest.
            query = { targetId: req.user._id };
        }
        // Admins see everything (query remains {})

        const complaints = await Complaint.find(query)
            .populate('studentId', 'name enrollmentNumber department email')
            .populate('targetId', 'name')
            .populate('responses.respondent', 'name role')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin / Teacher)
export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status, remarks } = req.body;
        
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only Admin or Target Teacher can update
        if (req.user?.role === 'teacher' && complaint.targetId?.toString() !== req.user?._id?.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this complaint' });
        }

        complaint.status = status;
        if (remarks) complaint.remarks = remarks;

        await complaint.save();
        res.json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Add response to complaint
// @route   POST /api/complaints/:id/reply
// @access  Private
export const addComplaintResponse = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Add response
        complaint.responses.push({
            respondent: req.user!._id,
            message,
            timestamp: new Date()
        });

        // Auto-update status if Teacher/Admin replies to a submitted complaint
        if (req.user?.role !== 'student' && complaint.status === 'Submitted') {
            complaint.status = 'In Review';
        }

        await complaint.save();
        
        // Re-populate to return the new respondent data natively
        await complaint.populate('responses.respondent', 'name role');
        
        res.json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete a complaint (if pending)
// @route   DELETE /api/complaints/:id
// @access  Private (Student)
export const deleteComplaint = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only the creator can delete, and only if it hasn't been reviewed yet
        if (complaint.studentId.toString() !== req.user?._id?.toString()) {
             return res.status(403).json({ message: 'Not authorized to delete this complaint' });
        }

        if (complaint.status !== 'Submitted') {
             return res.status(400).json({ message: 'Cannot delete a complaint that is actively under review.' });
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
