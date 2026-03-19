import mongoose, {Schema, Document} from "mongoose";

export interface IAcademicYear extends Document {
    name: string; // e.g., "2023-2024"
    fromYear: Date; // e.g., 2023
    toYear: Date; // e.g., 2024
    iscurrent: boolean; // Indicates if this is the current academic year
}

const AcademicYearSchema: Schema<IAcademicYear> = new Schema({
    name: {type: String, required: true, unique: true},
    fromYear: {type: Date, required: true},
    toYear: {type: Date, required: true},
    iscurrent: {type: Boolean, default: false}
}, {
    timestamps: true        
    }
);

export default mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);