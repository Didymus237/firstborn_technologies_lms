import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRecord {
    student: mongoose.Types.ObjectId;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    remarks?: string;
}

export interface IAttendance extends Document {
    classId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    date: Date;
    records: IAttendanceRecord[];
    markedBy: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId; // Responsible teacher
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true, default: 'Present' },
    remarks: { type: String }
}, { _id: false });

const AttendanceSchema = new Schema<IAttendance>({
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true, default: Date.now },
    records: [AttendanceRecordSchema],
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure one attendance per class per subject per date
AttendanceSchema.index({ classId: 1, subjectId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
