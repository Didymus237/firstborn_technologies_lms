import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user';

dotenv.config();

const resetPasswords = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error('MONGO_URL is not set in env');
      process.exit(1);
    }
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const emails = ['didiertoh@gmail.com', 'lewang@gmail.com', 'cloud@student.com'];
    
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user) {
        user.password = 'Didierc#2021';
        await user.save();
        console.log(`Password reset successfully for ${email} (${user.role})`);
      } else {
        console.warn(`User not found for email: ${email}`);
      }
    }

    console.log('All passwords reset operations completed.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during password reset:', error);
  }
};

resetPasswords();
