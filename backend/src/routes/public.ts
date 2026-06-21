import express, { type Request, type Response } from "express";
import { getPublicStats, submitInquiry } from "../controllers/public";
import Complaint from "../models/complaint";
import mongoose from "mongoose";

const publicRouter = express.Router();

publicRouter.get("/test", async (req: Request, res: Response) => {
    try {
        const complaint = await Complaint.create({
            studentId: new mongoose.Types.ObjectId(),
            title: "Test",
            description: "Test",
            category: "Academic",
            priority: "Low",
            aiSeverity: "Critical"
        });
        res.json(complaint);
    } catch (e: any) {
        res.status(400).json({ error: e.message, stack: e.stack });
    }
});

// Mount public logic without the JWT 'protect' middleware mapping to allow anonymous access
publicRouter.get("/stats", getPublicStats);
publicRouter.post("/inquiry", submitInquiry);

export default publicRouter;
