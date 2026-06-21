import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/subject';
import User from './models/user';

dotenv.config();

const addSubject = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error('MONGO_URL is not set');
      process.exit(1);
    }
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Find the main trainer MR TOH DIDYMUS ANKINIMBOM to assign
    const teacher = await User.findOne({ email: 'toh@gmail.com' });
    if (!teacher) {
      console.error('Trainer toh@gmail.com not found');
      await mongoose.connection.close();
      return;
    }

    const code = 'BASIC-COMP';
    const name = 'Basic Computing';

    const existing = await Subject.findOne({ code });
    if (existing) {
      console.log('Subject already exists:', existing.name);
    } else {
      const newSub = await Subject.create({
        name,
        code,
        teacher: teacher._id,
        isActive: true
      });
      console.log('Successfully created subject:', newSub.name, 'with code', newSub.code);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error adding subject:', err);
  }
};

addSubject();
