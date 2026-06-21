import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentRecord {
  amount: number;
  paymentDate: Date;
  method: "cash" | "paytm" | "phonepay" | "card" | "mtn_money" | "orange_money" | "transfer";
  reference?: string;
  recordedBy: mongoose.Types.ObjectId;
}

export interface IFeeInvoice extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  academicYear: string;
  feeCategory: mongoose.Types.ObjectId;
  amount: number;
  amountPaid: number;
  status: "pending" | "partial" | "paid";
  dueDate?: Date;
  paymentHistory: IPaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentRecordSchema = new Schema<IPaymentRecord>({
  amount: { type: Number, required: true, min: 1 },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, enum: ["cash", "paytm", "phonepay", "card", "mtn_money", "orange_money", "transfer"], required: true },
  reference: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const feeInvoiceSchema = new Schema<IFeeInvoice>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    academicYear: { type: String, required: true },
    feeCategory: { type: Schema.Types.ObjectId, ref: "FeeCategory", required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
    dueDate: { type: Date },
    paymentHistory: [paymentRecordSchema],
  },
  { timestamps: true }
);

// Optimize lookups
feeInvoiceSchema.index({ student: 1, class: 1, academicYear: 1 });
feeInvoiceSchema.index({ status: 1 });

export default mongoose.model<IFeeInvoice>("FeeInvoice", feeInvoiceSchema);
