import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  title: string;
  description?: string;
  class: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  fileUrl: string;        // The physical or cloud URL string
  fileType: string;      // The MIME type or extension (pdf, image, video, etc)
  originalName: string;  // Original file name provided by the user
  fileSize: number;      // Size in bytes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true },
    description: { type: String },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMaterial>("Material", MaterialSchema);
