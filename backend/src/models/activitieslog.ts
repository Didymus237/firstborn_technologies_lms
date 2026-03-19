import mongoose,{ Schema, Document} from "mongoose";

export interface IActivityLog extends Document {
    user: mongoose.Types.ObjectId; // Reference to the User model (user ID)
    action: string; // Description of the action performed
    details?: string; // Additional details about the action
    createdAt: Date; // Timestamp of when the log entry was created
}

const ActivitiesLogSchema: Schema<IActivityLog> = new Schema({
    user: {type: Schema.Types.ObjectId,  required: true, ref: 'User'},
    action: {type: String, required: true},
    details: {type: String},
}, { 
    timestamps: true 
});

export default mongoose.model<IActivityLog>('ActivitiesLog', ActivitiesLogSchema);