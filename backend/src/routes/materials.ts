import express from "express";
import {
    createMaterial,
    getMaterials,
    deleteMaterial
} from "../controllers/material";
import { protect, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const materialsRouter = express.Router();

// The "file" field string matches the FormData append key in the React Frontend
materialsRouter.post("/", protect, authorize(["admin", "teacher"]), upload.single("file"), createMaterial);
materialsRouter.get("/", protect, getMaterials);
materialsRouter.delete("/:id", protect, authorize(["admin", "teacher"]), deleteMaterial);

export default materialsRouter;
