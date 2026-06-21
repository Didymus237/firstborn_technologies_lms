import { type Request, type Response } from 'express';
import IdTemplate from '../models/idTemplate';

//@desc Create a new ID Template
//@route POST /api/id-cards/templates
//@access Private/Admin
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { name, description, orientation, width, height, backgroundUrl, backgroundColor, fields } = req.body;

        const newTemplate = await IdTemplate.create({
            name,
            description,
            orientation,
            width,
            height,
            backgroundUrl,
            backgroundColor,
            fields,
            createdBy: (req as any).user._id
        });

        res.status(201).json(newTemplate);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Get all ID Templates
//@route GET /api/id-cards/templates
//@access Private/Admin
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await IdTemplate.find().populate('createdBy', 'firstName lastName');
        res.status(200).json(templates);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Get ID Template by ID
//@route GET /api/id-cards/templates/:id
//@access Private/Admin
export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await IdTemplate.findById(req.params.id).populate('createdBy', 'firstName lastName');
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Update an ID Template
//@route PUT /api/id-cards/templates/:id
//@access Private/Admin
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await IdTemplate.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.status(200).json(template);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc Delete an ID Template
//@route DELETE /api/id-cards/templates/:id
//@access Private/Admin
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const template = await IdTemplate.findByIdAndDelete(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.status(200).json({ message: "Template removed successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
