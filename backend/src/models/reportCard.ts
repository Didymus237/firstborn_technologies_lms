import mongoose, { Schema, Document } from "mongoose";

export interface IReportCard extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  examTerm: mongoose.Types.ObjectId;
  marks: mongoose.Types.ObjectId[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  finalGrade: string;
  attendancePercentage?: number;
  teacherRemarks?: string;
  principalRemarks?: string;
  status: "Pass" | "Fail" | "Promoted" | "Pending";
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportCardSchema = new Schema<IReportCard>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    examTerm: { type: Schema.Types.ObjectId, ref: "ExamTerm", required: true },
    marks: [{ type: Schema.Types.ObjectId, ref: "Marks" }],
    totalMaxMarks: { type: Number, required: true },
    totalObtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    finalGrade: { type: String, required: true },
    attendancePercentage: { type: Number },
    teacherRemarks: { type: String },
    principalRemarks: { type: String },
    status: {
      type: String,
      enum: ["Pass", "Fail", "Promoted", "Pending"],
      default: "Pending",
    },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One report card per student per term
ReportCardSchema.index({ student: 1, examTerm: 1 }, { unique: true });

export default mongoose.model<IReportCard>("ReportCard", ReportCardSchema);
