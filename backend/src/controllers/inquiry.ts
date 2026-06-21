import { type Request, type Response } from "express";
import Inquiry from "../models/inquiry";

//@desc Get all public inquiries
//@route GET /api/inquiries
//@access Private/Admin
export const getAllInquiries = async (req: Request, res: Response) => {
    try {
        const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
        res.status(200).json({ inquiries });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//@desc Update inquiry status
//@route PUT /api/inquiries/:id
//@access Private/Admin
export const updateInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const validStatuses = ['New', 'Contacted', 'Closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        res.status(200).json({ message: "Inquiry updated", inquiry });
    } catch (error) {
        console.error("Error updating inquiry:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
