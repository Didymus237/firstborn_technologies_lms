import { type Request, type Response } from "express";
import { logActivity } from "../utils/activitieslog";
import Material from "../models/material";
import path from "path";
import fs from "fs";

//@desc Upload new Material
//@route POST /api/materials
//@access Private (teacher, admin)
export const createMaterial = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, description, class: classId, subject } = req.body;
        const teacherId = (req as any).user?._id as string;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded. Please attach a file." });
        }

        // We'll store the relative path for the frontend (e.g. /uploads/materials/123-file.pdf)
        const fileUrl = `/uploads/materials/${file.filename}`;
        
        const material = await Material.create({
            title,
            description,
            class: classId,
            subject,
            teacher: teacherId,
            fileUrl: fileUrl,
            fileType: file.mimetype,
            originalName: file.originalname,
            fileSize: file.size,
            isActive: true,
        });

        await logActivity({
            userId: teacherId,
            action: `Uploaded material: ${title}`
        });

        res.status(201).json({ message: "Material uploaded successfully", material });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

//@desc Get Materials
//@route GET /api/materials
//@access Private
export const getMaterials = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        let query = {};

        if (user.role === "student") {
            query = { class: user.studentClass, isActive: true };
        } else if (user.role === "teacher") {
            query = { teacher: user._id };
        }

        const materials = await Material.find(query)
            .populate("subject", "name config")
            .populate("class", "name section")
            .populate("teacher", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};

//@desc Delete Material
//@route DELETE /api/materials/:id
//@access Private (teacher, admin)
export const deleteMaterial = async (req: Request, res: Response): Promise<any> => {
    try {
        const materialId = req.params.id as string;
        const user = (req as any).user;
        const material = await Material.findById(materialId);

        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        // Validate Authorization
        if (user.role === "teacher" && String(material.teacher) !== String(user._id)) {
             return res.status(403).json({ message: "Not authorized to delete this material" });
        }

        // Locate and delete physical file
        const filePath = path.join(process.cwd(), material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete synchronously or use async
        }

        await Material.findByIdAndDelete(materialId);

        await logActivity({
            userId: user._id,
            action: `Deleted material: ${material.title}`
        });

        res.status(200).json({ message: "Material deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
