import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  currentTerm: string;
  rolePermissions: {
    role: string;
    permissions: string[];
  }[];
}

const settingSchema = new Schema<ISetting>(
  {
    schoolName: {
      type: String,
      required: true,
      default: "Firstborn Technologies Gravity",
    },
    address: {
      type: String,
      required: true,
      default: "123 Educational Block",
    },
    phone: {
      type: String,
      required: true,
      default: "+1-234-567-8900",
    },
    email: {
      type: String,
      required: true,
      default: "contact@firstborntech.com",
    },
    currentTerm: {
      type: String,
      required: true,
      default: "1st Term",
      enum: ["1st Term", "2nd Term", "3rd Term"],
    },
    rolePermissions: [
      {
        role: { type: String, required: true },
        permissions: [{ type: String }],
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', settingSchema);
