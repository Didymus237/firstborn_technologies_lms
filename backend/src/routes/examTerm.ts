import express from "express";
import { createTerm, getTerms, toggleLockTerm } from "../controllers/examTerm";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, authorize(["admin", "teacher"]), createTerm);
router.get("/", protect, getTerms);
router.put("/:id/lock", protect, authorize(["admin"]), toggleLockTerm);

export default router;
