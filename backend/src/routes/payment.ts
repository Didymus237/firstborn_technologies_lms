import express from 'express';
import { protect } from '../middleware/auth';
import { initiatePayment, handleStripeWebhook } from '../controllers/payment';

const router = express.Router();

// Protected: Students initiating payments
router.post('/initiate', protect, initiatePayment);

// Public: Webhooks from providers
// Note: We use express.raw() or similar for Stripe specifically in server.ts if needed
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
