import express from "express";
import { protect, authorize } from "../middleware/auth";
import { getAllInquiries, updateInquiryStatus } from "../controllers/inquiry";

const inquiryRouter = express.Router();

inquiryRouter.use(protect); // Ensure user is logged in
inquiryRouter.use(authorize(['admin'])); // Ensure user is an Administrator

inquiryRouter.get("/", getAllInquiries);
inquiryRouter.put("/:id", updateInquiryStatus);

export default inquiryRouter;
