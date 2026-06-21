import type { Request, Response } from 'express';
import crypto from 'crypto';
import Receipt from '../models/receipt';
import User from '../models/user';

// Helper to generate Unique Receipt ID
const generateReceiptId = () => {
    return 'RCPT-' + new Date().getFullYear() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Create new payment receipt
// @route   POST /api/receipts
// @access  Protected
export const createReceipt = async (req: Request, res: Response) => {
    try {
        const { studentId, paymentType, amount, paymentMode, method, transactionId, status, remarks } = req.body;

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student target not found natively.' });
        }

        const receipt = await Receipt.create({
            receiptId: generateReceiptId(),
            student: studentId,
            paymentType,
            amount,
            paymentMode,
            method,
            transactionId,
            status: status || 'Pending', // Online defaults might differ but cash is usually Pending or Verified dynamically
            remarks
        });

        // Here we could dispatch an email automatically...
        
        return res.status(201).json(receipt);
    } catch (error) {
        console.error('Error creating receipt:', error);
        return res.status(500).json({ message: 'Server error processing transaction.' });
    }
};

// @desc    Get all receipts (Admin Ledger)
// @route   GET /api/receipts
// @access  Protected (Admin)
export const getAllReceipts = async (req: Request, res: Response) => {
    try {
        const { status, paymentMode, dateStart, dateEnd } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (paymentMode) query.paymentMode = paymentMode;

        if (dateStart && dateEnd) {
            query.createdAt = {
                $gte: new Date(dateStart as string),
                $lte: new Date(dateEnd as string)
            };
        }

        const receipts = await Receipt.find(query)
            .populate('student', 'name email enrollmentNumber department')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json(receipts);
    } catch (error) {
         console.error('Error fetching ledger:', error);
         return res.status(500).json({ message: 'Server error querying financial ledger.' });
    }
};

// @desc    Get user's receipts
// @route   GET /api/receipts/my
// @access  Protected
export const getMyReceipts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const receipts = await Receipt.find({ student: user._id })
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json(receipts);
    } catch (error) {
         return res.status(500).json({ message: 'Server error querying user receipts.' });
    }
};

// @desc    Get single receipt by ID (For QR/Verification logic)
// @route   GET /api/receipts/:id
// @access  Public or Protected
export const getReceiptById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        let query: any = { _id: id };

        // If the ID looks like the custom RCPT string instead of a Mongo ID
        if (id.startsWith('RCPT-')) {
             query = { receiptId: id };
        } else if (!id.match(/^[0-9a-fA-F]{24}$/)) {
             return res.status(400).json({ message: 'Invalid receipt identifier format.' });
        }

        const receipt = await Receipt.findOne(query)
            .populate('student', 'name email enrollmentNumber department')
            .populate('verifiedBy', 'name');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt record completely not found.' });
        }

        return res.status(200).json(receipt);
    } catch (error) {
         return res.status(500).json({ message: 'Server error querying receipt.' });
    }
};

// @desc    Verify or Reject receipt
// @route   PUT /api/receipts/:id/verify
// @access  Protected (Admin)
export const verifyReceipt = async (req: Request, res: Response) => {
    try {
        const { status, remarks } = req.body; // 'Verified' or 'Rejected'
        const { id } = req.params;

        if (!['Verified', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status format.' });
        }

        const user = (req as any).user;
        const receipt = await Receipt.findByIdAndUpdate(
            id,
            { 
               status, 
               remarks,
               verifiedBy: user._id 
            },
            { new: true }
        ).populate('student', 'name email enrollmentNumber department')
         .populate('verifiedBy', 'name');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found natively.' });
        }

        return res.status(200).json({ message: `Receipt successfully marked as ${status}.`, receipt });
    } catch (error) {
         return res.status(500).json({ message: 'Server error executing Admin validation.' });
    }
};
