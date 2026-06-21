import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
    exam: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    answers: {
        question: mongoose.Types.ObjectId;
        answer: string;
        isCorrect: boolean;
        correctAnswer: string;
    }[];
    score: number;
    submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    exam: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    answers: [
        {
            question: { type: Schema.Types.ObjectId, required: true },
            answer: { type: String, required: false },
            isCorrect: { type: Boolean, required: true },
            correctAnswer: { type: String, required: false },
        }
    ],
    score: {
        type: Number,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

//prevent duplicate submissions
SubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);

