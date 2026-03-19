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
  isActive: boolean;
  studentClass?: string | null;
  teacherSubjects?: string[] | null;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.STUDENT},
  isActive: { type: Boolean, default: true },
  studentClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // for students
  teacherSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }] // for teachers
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
