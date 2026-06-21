import mongoose, { Schema, Document } from 'mongoose';

export interface IOfferLog extends Document {
    referenceNumber: string;
    recipientName: string;
    recipientEmail: string;
    userId?: mongoose.Types.ObjectId;
    templateId?: mongoose.Types.ObjectId;
    status: 'sent' | 'draft' | 'failed';
    errorMessage?: string;
    sentAt: Date;
}

const OfferLogSchema: Schema<IOfferLog> = new Schema({
    referenceNumber: { type: String, required: true, unique: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferTemplate' },
    status: { type: String, enum: ['sent', 'draft', 'failed'], default: 'draft' },
    errorMessage: { type: String },
    sentAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const OfferLog = mongoose.model<IOfferLog>('OfferLog', OfferLogSchema);
export default OfferLog;
