import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  receiptId: string;
  student: mongoose.Types.ObjectId;
  paymentType: 'Fees' | 'Admission' | 'Other';
  amount: number;
  paymentMode: 'Cash' | 'Online' | 'Mobile Money' | 'UPI' | 'Card';
  method: "cash" | "paytm" | "phonepay" | "card" | "mtn_money" | "orange_money" | "transfer";
  transactionId?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const receiptSchema: Schema<IReceipt> = new Schema(
  {
    receiptId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paymentType: {
      type: String,
      enum: ['Fees', 'Admission', 'Other'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Online', 'Mobile Money', 'UPI', 'Card'],
      required: true
    },
    method: {
      type: String,
      enum: ["cash", "paytm", "phonepay", "card", "mtn_money", "orange_money", "transfer"],
      required: true,
      default: "cash"
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<IReceipt>('Receipt', receiptSchema);
