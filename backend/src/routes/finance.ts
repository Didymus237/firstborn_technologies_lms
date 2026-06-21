import express from "express";
import {
    createFeeCategory,
    getFeeCategories,
    deleteFeeCategory,
    generateBulkInvoices,
    getAllInvoices,
    getStudentInvoices,
    recordPayment,
    generateSingleInvoice
} from "../controllers/finance";
import { protect, authorize } from "../middleware/auth";

const financeRouter = express.Router();

// ================= ADMIN SECURE ROUTES =================
financeRouter.post("/categories", protect, authorize(["admin"]), createFeeCategory);
financeRouter.get("/categories", protect, getFeeCategories); // Accessible by all to see pricing
financeRouter.delete("/categories/:id", protect, authorize(["admin"]), deleteFeeCategory);

financeRouter.post("/invoices/bulk", protect, authorize(["admin", "teacher"]), generateBulkInvoices);
financeRouter.post("/invoices/single", protect, authorize(["admin", "teacher"]), generateSingleInvoice);
financeRouter.get("/invoices/all", protect, authorize(["admin", "teacher"]), getAllInvoices);

financeRouter.put("/invoices/:invoiceId/pay", protect, authorize(["admin"]), recordPayment);

// ================= STUDENT/PARENT ROUTES =================
financeRouter.get("/invoices/me", protect, authorize(["student", "parent"]), getStudentInvoices);

export default financeRouter;
