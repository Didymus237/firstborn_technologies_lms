import express from 'express';
import { createReceipt, getAllReceipts, getMyReceipts, getReceiptById, verifyReceipt } from '../controllers/receipt';
import { protect, authorize } from '../middleware/auth';

const receiptRoutes = express.Router();

// Admin Routes
receiptRoutes.get('/', protect, authorize(['admin']), getAllReceipts);
receiptRoutes.put('/:id/verify', protect, authorize(['admin']), verifyReceipt);
receiptRoutes.post('/', protect, authorize(['admin', 'student', 'teacher']), createReceipt);

// User Routes
receiptRoutes.get('/my', protect, getMyReceipts);

// Public / Semi-Public validation route (Must be able to query receipts)
receiptRoutes.get('/:id', getReceiptById);

export default receiptRoutes;
