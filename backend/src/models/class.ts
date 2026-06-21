import mongoose, { Schema } from "mongoose";

//interface for tpypescript to know the structure of the class document
export interface IClass extends mongoose.Document {
    name: string; // e.g., "Grade 10"
    academicYear: mongoose.Types.ObjectId;
    classTeacher: mongoose.Types.ObjectId; // Reference to the User model (teacher of this class)
    students: mongoose.Types.ObjectId[]; // Array of references to User model (students in this class)
    subjects: mongoose.Types.ObjectId[]; // Array of subjects taught in this class
    capacity: number; // Maximum number of students allowed in the class
    
}

const ClassSchema = new mongoose.Schema<IClass>({
    name: {type: String, required: true, trim: false},
    academicYear: {type: Schema.Types.ObjectId, required: true, ref: 'AcademicYear'},
    classTeacher: {type: Schema.Types.ObjectId, required: false, ref: 'User', default: null},
    students: [{type:Schema.Types.ObjectId, ref: 'User'}],
    subjects: [{type: Schema.Types.ObjectId, ref: 'Subject'}],
    capacity: {type: Number, default: 40}
}, {
    timestamps: true
});

// Create a compound index to ensure unique class names within the same academic year
ClassSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<IClass>('Class', ClassSchema);