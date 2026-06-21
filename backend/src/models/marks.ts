import mongoose, { Schema, Document } from "mongoose";

export interface IMarks extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  examTerm: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  maxMarks: number;
  obtainedMarks: number;
  grade?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarksSchema = new Schema<IMarks>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    examTerm: { type: Schema.Types.ObjectId, ref: "ExamTerm", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    obtainedMarks: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate marks for same student, term, and subject
MarksSchema.index({ student: 1, examTerm: 1, subject: 1 }, { unique: true });

export default mongoose.model<IMarks>("Marks", MarksSchema);
