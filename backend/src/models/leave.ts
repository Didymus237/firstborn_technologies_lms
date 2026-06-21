import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
    teacherId: mongoose.Types.ObjectId;
    leaveType: 'Casual' | 'Sick' | 'Emergency';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

const leaveSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['Casual', 'Sick', 'Emergency'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

const Leave = mongoose.model<ILeave>('Leave', leaveSchema);

export default Leave;
