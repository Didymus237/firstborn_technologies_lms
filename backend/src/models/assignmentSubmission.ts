import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  content: string; // The text answer submitted by the student
  attachments?: string[]; // Any files uploaded
  status: "submitted" | "graded" | "late";
  score?: number;
  feedback?: string; // Optional feedback from the teacher
  submittedAt: Date;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    status: { type: String, enum: ["submitted", "graded", "late"], default: "submitted" },
    score: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent a student from submitting multiple times for the same assignment
AssignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model<IAssignmentSubmission>("AssignmentSubmission", AssignmentSubmissionSchema);
