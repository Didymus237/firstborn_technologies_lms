import mongoose from "mongoose";

// ================= QUESTION =================
export interface IQuestion extends mongoose.Document {
  questionText: string;
  type: "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER";
  options?: string[];
  correctAnswer: string; // ✅ single answer (cleaner)
  points: number;
}

// ================= EXAM =================
export interface IExam extends mongoose.Document {
  title: string;
  subject: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  duration: number;
  topic: string; // ✅ ADDED
  difficulty: "easy" | "medium" | "hard"; // ✅ ADDED
  questions: IQuestion[];
  dueDate: Date;
  isActive: boolean;
}

// ================= SCHEMA =================
const examSchema = new mongoose.Schema<IExam>(
  {
    title: { type: String, required: true },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    duration: { type: Number, required: true },

    topic: { type: String, required: true }, // ✅ ADDED

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    }, // ✅ ADDED

    questions: [
      {
        questionText: { type: String, required: true },

        type: {
          type: String,
          enum: ["MCQ", "SHORT_ANSWER", "LONG_ANSWER"],
          required: true,
        },

        options: {
          type: [String],
          validate: {
            validator: function (this: any, value: string[]) {
              if (this.type === "MCQ") {
                return value && value.length >= 2;
              }
              return true;
            },
            message: "MCQ must have at least 2 options",
          },
        },

        correctAnswer: {
          type: String,
          required: true,
        },

        points: { type: Number, required: true },
      },
    ],

    dueDate: { type: Date, required: true },

    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ================= MODEL =================
export default mongoose.model<IExam>("Exam", examSchema);