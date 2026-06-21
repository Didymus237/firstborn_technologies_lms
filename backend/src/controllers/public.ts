import { type Request, type Response } from "express";
import User from "../models/user";
import Subject from "../models/subject";
import Class from "../models/class";
import Inquiry from "../models/inquiry";
import { sendEmailAlert } from "../utils/notifications";

//@desc get public homepage statistics
//@route GET /api/public/stats
//@access Public
export const getPublicStats = async (req: Request, res: Response) => {
    try {
        // Run aggregations in parallel to minimize latency on the Landing Page
        const [
            totalStudents,
            totalTeachers,
            totalSubjects,
            totalClasses
        ] = await Promise.all([
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "teacher" }),
            Subject.countDocuments(),
            Class.countDocuments()
        ]);

        const stats = {
            totalStudents,
            totalTeachers,
            totalSubjects,
            totalClasses
        };

        res.status(200).json({ stats });
    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//@desc Submit a public inquiry lead form
//@route POST /api/public/inquiry
//@access Public
export const submitInquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, course } = req.body;

        if (!name || !email || !phone || !course) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            course
        });

        // Trigger notifications asynchronously to prevent client blocking
        sendEmailAlert({ name, email, phone, course }).catch(console.error);

        res.status(201).json({ message: "Inquiry submitted successfully", inquiry });
    } catch (error) {
        console.error("Error submitting inquiry:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
