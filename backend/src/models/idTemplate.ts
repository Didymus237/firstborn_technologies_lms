import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IIdTemplateField {
  id: string; // unique identifier for the HTML DOM Drag-and-Drop system
  type: 'text' | 'photo' | 'qr' | 'barcode' | 'logo' | 'fixed-text';
  label: string; // Human readable label (e.g. "Student Name")
  key?: string; // Mongoose Mapping Key (e.g. "profile.firstName", "rollNumber")
  value?: string; // Override value for 'fixed-text' or static inputs
  x: number; // Percentage or absolute X coordinate
  y: number; // Percentage or absolute Y coordinate
  width?: number; // Graphic bounding box
  height?: number; // Graphic bounding box
  fontSize?: number;
  color?: string; // Hex string
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex?: number;
}

export interface IIdTemplate extends Document {
  name: string;
  description?: string;
  orientation: 'horizontal' | 'vertical';
  width: number; // Physical dimensions (e.g. standard CR80 is 85.6mm x 53.98mm)
  height: number;
  backgroundUrl?: string;
  backgroundColor: string;
  fields: IIdTemplateField[];
  isActive: boolean;
  createdBy: Types.ObjectId;
}

const IdTemplateFieldSchema = new Schema<IIdTemplateField>({
  id: { type: String, required: true },
  type: { 
      type: String, 
      enum: ['text', 'photo', 'qr', 'barcode', 'logo', 'fixed-text'], 
      required: true 
  },
  label: { type: String, required: true },
  key: { type: String },
  value: { type: String },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  fontSize: { type: Number, default: 14 },
  color: { type: String, default: '#000000' },
  fontFamily: { type: String, default: 'Inter' },
  fontWeight: { type: String, default: 'normal' },
  textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
  zIndex: { type: Number, default: 10 }
}, { _id: false });

const IdTemplateSchema = new Schema<IIdTemplate>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  orientation: { type: String, enum: ['horizontal', 'vertical'], default: 'horizontal' },
  width: { type: Number, required: true, default: 1011 }, // pixel resolution mapped equivalents
  height: { type: Number, required: true, default: 638 },
  backgroundUrl: { type: String },
  backgroundColor: { type: String, default: '#ffffff' },
  fields: { type: [IdTemplateFieldSchema], default: [] },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const IdTemplate = mongoose.model<IIdTemplate>('IdTemplate', IdTemplateSchema);

export default IdTemplate;
