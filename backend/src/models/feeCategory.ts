import mongoose, { Document, Schema } from "mongoose";

export interface IFeeCategory extends Document {
  name: string;
  description?: string;
  amount: number;
  type: "one-time" | "recurring";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeCategorySchema = new Schema<IFeeCategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["one-time", "recurring"], default: "one-time" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFeeCategory>("FeeCategory", feeCategorySchema);
