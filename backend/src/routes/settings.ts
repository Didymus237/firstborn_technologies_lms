import express from "express";
import { getSettings, updateSettings } from "../controllers/setting";
import { protect, authorize } from "../middleware/auth";

export const settingRouter = express.Router();

// Fetch settings (Admins and Teachers can view, or specific per missions)
settingRouter.get("/", protect, getSettings);

// Update settings (Only Admins capable of system configuration changes)
settingRouter.put("/", protect, authorize(["admin"]), updateSettings);
