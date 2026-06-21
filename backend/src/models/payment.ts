import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  currency: string; // INR, XAF, USD
  gateway: 'stripe' | 'paytm' | 'phonepay' | 'mtn_money' | 'orange_money' | 'manual';
  status: 'pending' | 'success' | 'failed';
  gatewayTransactionId?: string;
  paymentMethod?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeInvoice', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  gateway: { 
    type: String, 
    enum: ['stripe', 'paytm', 'phonepay', 'mtn_money', 'orange_money', 'manual'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  gatewayTransactionId: { type: String },
  paymentMethod: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
