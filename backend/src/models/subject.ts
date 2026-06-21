import mongoose from "mongoose";

// Interface for TypeScript to define the structure of the Subject document
export interface ISubject extends mongoose.Document {
    name: string; // e.g., "Mathematics"
    code: string; // e.g., "MATH101"
    teacher: mongoose.Types.ObjectId; // Reference to the User model (teacher of this subject)
    isActive: boolean; // Indicates if the subject is currently active
}

const SubjectSchema = new mongoose.Schema<ISubject>({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);