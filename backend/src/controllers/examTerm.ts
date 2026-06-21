import type { Request, Response } from "express";
import ExamTerm from "../models/examTerm";
import AcademicYear from "../models/academicYear";

export const createTerm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, academicYear, startDate, endDate, isActive } = req.body;
    const term = new ExamTerm({ name, academicYear, startDate, endDate, isActive });
    await term.save();
    res.status(201).json({ message: "Exam term created successfully", term });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create term", error: error.message });
  }
};

export const getTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    let terms = await ExamTerm.find().populate("academicYear");
    
    // Auto-create a default term if none exist so the dropdown isn't empty
    if (terms.length === 0) {
      let activeYear = await AcademicYear.findOne({ iscurrent: true });
      if (!activeYear) {
        activeYear = await AcademicYear.findOne();
      }
      
      if (activeYear) {
        await ExamTerm.create({
          name: "Term 1",
          academicYear: activeYear._id,
          isActive: true
        });
        terms = await ExamTerm.find().populate("academicYear");
      }
    }

    res.status(200).json({ terms });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch terms", error: error.message });
  }
};

export const toggleLockTerm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const term = await ExamTerm.findById(id);
    if (!term) {
      res.status(404).json({ message: "Exam term not found" });
      return;
    }
    term.isLocked = !term.isLocked;
    await term.save();
    res.status(200).json({ message: `Term ${term.isLocked ? "locked" : "unlocked"} successfully`, term });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to toggle lock status", error: error.message });
  }
};
