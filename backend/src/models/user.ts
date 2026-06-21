import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

export type  UserRoles = "admin" | "teacher" | "student" | "parent";

// Define the User interface that extends mongoose.Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoles;
  country: string;
  isActive: boolean;
  phone?: string;
  studentClass?: mongoose.Types.ObjectId | string | null;
  teacherSubjects?: string[] | null;
  enrollmentNumber?: string;
  fatherName?: string;
  dob?: Date;
  presentAddress?: string;
  permanentAddress?: string;
  department?: string;
  courseDuration?: string;
  photoUrl?: string;
  rollNumber?: string;
  internshipSchool?: string;
  trainingDuration?: string;
  amountPaid?: number;
  amountPending?: number;
  totalTrainingFee?: number;
  trainingStartDate?: Date;
  trainingEndDate?: Date;
  passportNumber?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.STUDENT},
  country: { type: String, default: 'India' },
  isActive: { type: Boolean, default: true },
  studentClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // for students
  phone: { type: String },
  teacherSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // for teachers
  enrollmentNumber: { type: String, unique: true, sparse: true },
  rollNumber: { type: String },
  fatherName: { type: String },
  dob: { type: Date },
  presentAddress: { type: String },
  permanentAddress: { type: String },
  department: { type: String },
  courseDuration: { type: String },
  photoUrl: { type: String, default: "https://ui-avatars.com/api/?name=User" },
  internshipSchool: { type: String },
  trainingDuration: { type: String },
  amountPaid: { type: Number, default: 0 },
  amountPending: { type: Number, default: 0 },
  totalTrainingFee: { type: Number, default: 0 },
  trainingStartDate: { type: Date },
  trainingEndDate: { type: Date },
  passportNumber: { type: String }
}, {
  timestamps: true
});

//hash password before saving the user
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) return 
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
