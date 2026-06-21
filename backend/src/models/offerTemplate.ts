import mongoose, { Schema, Document } from 'mongoose';

export type OfferType = 'student' | 'teacher' | 'intern' | 'staff';

export interface IOfferTemplate extends Document {
    name: string;
    type: OfferType;
    subjectLine: string;
    body: string;
    isActive: boolean;
}

const OfferTemplateSchema: Schema<IOfferTemplate> = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['student', 'teacher', 'intern', 'staff'], required: true },
    subjectLine: { type: String, required: true },
    body: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const OfferTemplate = mongoose.model<IOfferTemplate>('OfferTemplate', OfferTemplateSchema);
export default OfferTemplate;
