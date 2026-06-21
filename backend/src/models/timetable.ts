import mongoose from "mongoose";

export interface IPeriod extends mongoose.Document {
    subject: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    room?: string;
    startTime: string;
    endTime: string;
}

export interface IDaySchedule extends mongoose.Document {
    day: string; // e.g., "Monday"
    periods: IPeriod[];
}

export interface ITimetable extends mongoose.Document {
    class: mongoose.Types.ObjectId;
    academicYear: string;
    schedule: IDaySchedule[];
    createdAt: Date;
}

const timetableSchema = new mongoose.Schema<ITimetable>({
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    academicYear: { type: String, required: true },
    schedule: [
        {
            day: { type: String, required: true },
            periods: [
                {
                    type: { type: String, enum: ["class", "break"], default: "class" },
                    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
                    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                    room: { type: String }, // Optional room number
                    startTime: { type: String, required: true },
                    endTime: { type: String, required: true },
                }
            ]
        }
    ],
},
    { timestamps: true }

);

//prevent multiple timetables for the same class and academic year
timetableSchema.index({ class: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<ITimetable>("Timetable", timetableSchema);