import { type Request, type Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/payment';
import FeeInvoice from '../models/feeInvoice';
import Receipt from '../models/receipt';
import User from '../models/user';
import { logActivity } from '../utils/activitieslog';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.ac' as any,
});

// ================= INITIATE PAYMENT =================

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount, method } = req.body;
    const student = (req as any).user;
    if (!student || !student._id) {
      return res.status(401).json({ message: "Authentication context is missing or invalid" });
    }

    if (!invoiceId || !amount || !method) {
      return res.status(400).json({ message: "Missing required coordination parameters" });
    }

    const invoice = await FeeInvoice.findById(invoiceId as string).populate('feeCategory');
    if (!invoice) return res.status(404).json({ message: "Invoice not structurally located" });
    
    // Explicitly cast to IFeeInvoice & handle populated field
    const populatedInvoice = invoice as any;
    const feeCategory = populatedInvoice.feeCategory;
    
    if (!feeCategory || !feeCategory.name) {
      return res.status(404).json({ message: "Fee Category not attached or invalid" });
    }

    const categoryName = feeCategory.name as string;

    if (!invoice) return res.status(404).json({ message: "Invoice data is unexpectedly missing" });
    const outstanding = ((invoice as any).amount || 0) - ((invoice as any).amountPaid || 0);
    if (amount > (outstanding as number)) {
      return res.status(400).json({ message: "Requested amount exceeds outstanding debt" });
    }

    // Create a unique transaction ID for tracking
    const uuid = uuidv4();
    const shortUuid = uuid.split('-')[0] || 'default';
    const transactionId = `TXN-${shortUuid.toUpperCase()}-${Date.now()}`;

    let gatewayResponse: any = {};
    let gatewayType: any = method;

    // Logic based on Gateway
    switch (method) {
      case 'stripe':
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: { name: categoryName },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/dashboard/student/finance/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/dashboard/student/finance/cancel`,
          metadata: { 
            invoiceId: invoiceId as string, 
            studentId: student._id.toString(), 
            transactionId: transactionId 
          }
        });
        gatewayResponse = { checkoutUrl: session.url };
        break;

      case 'paytm':
        // Paytm initiation logic would go here (requires checksum)
        // For demonstration, we'll simulate a successful initiation
        gatewayResponse = { paytmToken: "simulated_token", orderId: transactionId };
        break;

      case 'mtn_money':
      case 'orange_money':
        // Cameroon specific Momo initiation logic
        gatewayResponse = { prompt: "Please check your phone for the MOMO prompt", pollUrl: `/api/payment/status/${transactionId}` };
        break;

      default:
        return res.status(400).json({ message: "Unsupported gateway protocol" });
    }

    // Create internal payment log
    await Payment.create({
      invoiceId,
      studentId: student._id,
      amount,
      currency: method === 'stripe' ? 'USD' : (student.country === 'Cameroon' ? 'XAF' : 'INR'),
      gateway: method,
      status: 'pending',
      gatewayTransactionId: transactionId,
      metadata: gatewayResponse
    });

    return res.status(200).json({
      message: "Payment initiated successfully",
      ...gatewayResponse,
      transactionId
    });

  } catch (error) {
    console.error("❌ Payment Initiation Error:", error);
    return res.status(500).json({ message: "Payment Gateway Communication Failure" });
  }
};

// ================= STRIPE WEBHOOK =================

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const rawBody = (req as any).rawBody;
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error("Webhook Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { invoiceId, studentId, transactionId } = session.metadata || {};

    if (invoiceId && studentId) {
      const studentObjectId = new mongoose.Types.ObjectId(studentId as string);
      const invoiceObjectId = new mongoose.Types.ObjectId(invoiceId as string);

      // 1. Update Payment Status
      const internalPayment = await Payment.findOneAndUpdate(
        { gatewayTransactionId: transactionId },
        { status: 'success', gatewayTransactionId: session.payment_intent as string },
        { new: true }
      );

      // 2. Update Invoice
      const invoice = await FeeInvoice.findById(invoiceObjectId);
      if (invoice) {
        invoice.amountPaid += (session.amount_total || 0) / 100;
        invoice.status = invoice.amountPaid >= invoice.amount ? 'paid' : 'partial';
        
        invoice.paymentHistory.push({
          amount: (session.amount_total || 0) / 100,
          method: 'card',
          reference: session.payment_intent as string,
          recordedBy: studentObjectId,
          paymentDate: new Date()
        });
        await invoice.save();

        // 3. Create Receipt
        const receiptCount = await Receipt.countDocuments();
        await Receipt.create({
          receiptId: `RCPT-${1000 + receiptCount + 1}`,
          student: studentObjectId,
          paymentType: 'Fees',
          amount: (session.amount_total || 0) / 100,
          paymentMode: 'Card',
          method: 'card',
          transactionId: session.payment_intent as string,
          status: 'Verified', // Auto-verified for cards
          remarks: `Integrated Stripe Payment for ${transactionId}`
        });

        await logActivity({ userId: studentObjectId.toString(), action: `Digital Fee Payment via Card: $${(session.amount_total || 0) / 100}` });
      }
    }
  }

  res.json({ received: true });
};
