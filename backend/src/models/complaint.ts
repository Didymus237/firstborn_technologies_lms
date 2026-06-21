import mongoose, { Document, Schema } from 'mongoose';

export interface IResponse {
    respondent: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
}

export interface IComplaint extends Document {
    studentId: mongoose.Types.ObjectId;
    targetId?: mongoose.Types.ObjectId; // Optional: If assigned to a specific teacher
    title: string;
    description: string;
    category: 'Academic' | 'Facilities' | 'Faculty' | 'Other';
    priority: 'Low' | 'Medium' | 'High';
    status: 'Submitted' | 'In Review' | 'Resolved' | 'Rejected';
    remarks?: string;
    responses: IResponse[];
    aiCategory?: string;
    aiSeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
    aiPriorityScore?: number;
    aiSuggestedAction?: string;
    aiSuggestedReply?: string;
    aiConfidenceScore?: number;
    createdAt: Date;
    updatedAt: Date;
}

const responseSchema = new Schema({
    respondent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const complaintSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Academic', 'Facilities', 'Faculty', 'Other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Review', 'Resolved', 'Rejected'],
        default: 'Submitted'
    },
    remarks: {
        type: String
    },
    responses: [responseSchema],
    aiCategory: {
        type: String
    },
    aiSeverity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical']
    },
    aiPriorityScore: {
        type: Number,
        min: 1,
        max: 100
    },
    aiSuggestedAction: {
        type: String
    },
    aiSuggestedReply: {
        type: String
    },
    aiConfidenceScore: {
        type: Number
    }
}, {
    timestamps: true
});

const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);

export default Complaint;
