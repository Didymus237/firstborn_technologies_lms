import mongoose, { Schema, Document } from "mongoose";

export interface IExamTerm extends Document {
  name: string; // e.g., "Term 1", "Mid-Term", "Finals"
  academicYear: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamTermSchema = new Schema<IExamTerm>(
  {
    name: { type: String, required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IExamTerm>("ExamTerm", ExamTermSchema);
