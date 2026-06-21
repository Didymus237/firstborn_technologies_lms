import { type Request, type Response } from "express";
import FeeCategory from "../models/feeCategory";
import FeeInvoice from "../models/feeInvoice";
import User from "../models/user";
import { logActivity } from "../utils/activitieslog";

// ================= FEE CATEGORIES =================

export const createFeeCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, amount, type } = req.body;
        const category = await FeeCategory.create({ name, description, amount, type });
        return res.status(201).json(category);
    } catch (error) {
        console.error("❌ Error creating custom Fee Category:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getFeeCategories = async (req: Request, res: Response) => {
    try {
        const categories = await FeeCategory.find().sort("-createdAt");
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
};

export const deleteFeeCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent deleting categories actively used in invoices safely
        const existingInvoice = await FeeInvoice.findOne({ feeCategory: id });
        if (existingInvoice) {
            return res.status(400).json({ message: "Cannot delete Fee Category. Invoices are currently tethered to this base model." });
        }

        await FeeCategory.findByIdAndDelete(id);
        return res.status(200).json({ message: "Fee category deleted globally" });
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
};

// ================= INVOICE GENERATORS =================

export const generateBulkInvoices = async (req: Request, res: Response) => {
    try {
        const { classId, academicYear, feeCategoryId, dueDate } = req.body;

        if (!classId || !academicYear || !feeCategoryId) {
            return res.status(400).json({ message: "Missing required structurally parameters" });
        }

        const category = await FeeCategory.findById(feeCategoryId);
        if (!category) return res.status(404).json({ message: "Fee Category not structurally located" });

        // Fetch active students directly attached to current class block universally
        const students = await User.find({ role: "student", studentClass: classId });
        if (!students.length) {
            return res.status(404).json({ message: "Zero students detected universally inside this class" });
        }

        let generatedCount = 0;

        for (const student of students) {
            // Prevent duplicating identical structural fees inside identical academic cycles gracefully
            const exists = await FeeInvoice.findOne({
                student: student._id,
                class: classId,
                academicYear,
                feeCategory: feeCategoryId
            });

            if (!exists) {
                await FeeInvoice.create({
                    student: student._id,
                    class: classId,
                    academicYear,
                    feeCategory: feeCategoryId,
                    amount: category.amount,
                    dueDate: dueDate || null
                });
                generatedCount++;
            }
        }

        const adminId = (req as any).user._id;
        await logActivity({ userId: adminId, action: `Generated ${generatedCount} bulk structural invoices seamlessly for ${category.name}` });

        return res.status(201).json({ message: `Successfully orchestrated ${generatedCount} structural Invoices seamlessly` });
    } catch (error) {
        console.error("❌ Error generating bulk invoices:", error);
        return res.status(500).json({ message: "Server Fault Generation Error" });
    }
};

export const generateSingleInvoice = async (req: Request, res: Response) => {
    try {
        const { studentId, classId, academicYear, feeCategoryId, dueDate } = req.body;

        if (!studentId || !classId || !academicYear || !feeCategoryId) {
            return res.status(400).json({ message: "Missing required targeting parameters" });
        }

        const category = await FeeCategory.findById(feeCategoryId);
        if (!category) return res.status(404).json({ message: "Fee Category physically missing" });

        // Prevent duplicates
        const exists = await FeeInvoice.findOne({
            student: studentId,
            class: classId,
            academicYear,
            feeCategory: feeCategoryId
        });

        if (exists) {
            return res.status(400).json({ message: "Invoice already exists for this specific student cycle" });
        }

        const invoice = await FeeInvoice.create({
            student: studentId,
            class: classId,
            academicYear,
            feeCategory: feeCategoryId,
            amount: category.amount,
            dueDate: dueDate || null
        });

        const adminId = (req as any).user._id;
        await logActivity({ userId: adminId, action: `Generated targeted invoice for student ${studentId}` });

        return res.status(201).json(invoice);
    } catch (error) {
        console.error("❌ Single Invoice Error:", error);
        return res.status(500).json({ message: "Failed to generate targeted invoice" });
    }
};

// ================= INVOICE RETRIEVALS =================

export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const { classId, academicYear, status, search } = req.query;

        const query: any = {};
        if (classId) query.class = classId;
        if (academicYear) query.academicYear = academicYear;
        if (status) query.status = status;

        let invoices = await FeeInvoice.find(query)
            .populate("student", "name rollNumber")
            .populate("class", "name")
            .populate("feeCategory", "name type")
            .sort("-createdAt");

        // Simple fuzzy search by student name if requested manually
        if (search) {
            const searchLower = (search as string).toLowerCase();
            invoices = invoices.filter(inv => 
                (inv.student as any)?.name?.toLowerCase().includes(searchLower)
            );
        }

        return res.status(200).json(invoices);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getStudentInvoices = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user._id;
        // For Parents reading logs universally
        const { specificStudent } = req.query;
        const targetId = specificStudent || studentId;

        const invoices = await FeeInvoice.find({ student: targetId })
            .populate("feeCategory", "name")
            .populate("class", "name")
            .sort("-createdAt");

        return res.status(200).json(invoices);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
};

// ================= RECORD PAYMENTS =================

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const { invoiceId } = req.params;
        const { amount, method, reference } = req.body;
        const adminId = (req as any).user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment denomination globally" });
        }

        const invoice = await FeeInvoice.findById(invoiceId).populate('student');
        if (!invoice) return res.status(404).json({ message: "Target invoice physically missing" });

        if (invoice.status === "paid" || invoice.amountPaid >= invoice.amount) {
            return res.status(400).json({ message: "Invoice is previously structurally cleared" });
        }

        // Mathematical overflow protection check native
        const outstanding = invoice.amount - invoice.amountPaid;
        const cleanAmount = amount > outstanding ? outstanding : amount;

        invoice.amountPaid += cleanAmount;
        invoice.status = invoice.amountPaid >= invoice.amount ? "paid" : "partial";

        invoice.paymentHistory.push({
            amount: cleanAmount,
            method,
            reference,
            recordedBy: adminId,
            paymentDate: new Date()
        });

        await invoice.save();

        // Professional Receipt Generation Construct
        const Receipt = (await import("../models/receipt")).default;
        const receiptCount = await Receipt.countDocuments();
        
        await Receipt.create({
            receiptId: `RCPT-${1000 + receiptCount + 1}`,
            student: invoice.student._id,
            paymentType: 'Fees',
            amount: cleanAmount,
            paymentMode: method === 'cash' ? 'Cash' : (['card', 'paytm', 'phonepay'].includes(method) ? 'Online' : 'Mobile Money'),
            method,
            transactionId: reference || `MANUAL-${Date.now()}`,
            status: 'Verified', 
            verifiedBy: adminId,
            remarks: `Manual verification for invoice ${invoiceId}`
        });

        await logActivity({ userId: adminId, action: `Recorded payment natively against Invoice ${invoiceId}` });

        return res.status(200).json({ message: "Payment universally documented securely with receipt generation", invoice });
    } catch (error) {
        console.error("❌ Error recording standard payment:", error);
        return res.status(500).json({ message: "Server Generic Fault" });
    }
};
