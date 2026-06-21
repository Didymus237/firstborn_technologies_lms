import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user';
import Subject from './models/subject';

dotenv.config();

const officialSubjects = [
  { name: "Fullstack Web Development (MRN Stack)", code: "MRN-STACK" },
  { name: "Cloud Computing & DevOps Engineering", code: "CLOUD-DEVOPS" },
  { name: "Artificial Intelligence & LLMs", code: "AI-LLM" },
  { name: "Cyber Security", code: "CYBER-SEC" },
  { name: "Mobile App Development", code: "MOBILE-APP" },
  { name: "Digital Marketing", code: "DIGITAL-MKT" },
  { name: "Programming Languages", code: "PROG-LANG" },
  { name: "Smart Home Automation Training", code: "SMART-HOME" },
  { name: "Medical Training Programs", code: "MED-TRAIN" },
  { name: "WordPress Development", code: "WP-DEV" },
  { name: "Basic Computing", code: "BASIC-COMP" },
];

const updateTrainersAndSubjects = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error('MONGO_URL is not set in env');
      process.exit(1);
    }
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // 1. Clean up misspelled account
    await User.deleteOne({ email: 'yongireneaus@gmaiil.com' });
    console.log('Cleaned up misspelled email: yongireneaus@gmaiil.com');

    // 2. Set toh@gmail.com to teacher role
    let trainerToh = await User.findOne({ email: 'toh@gmail.com' });
    if (!trainerToh) {
      trainerToh = await User.create({
        name: 'MR TOH DIDYMUS ANKINIMBOM',
        email: 'toh@gmail.com',
        role: 'teacher',
        password: 'password123',
        isActive: true
      });
      console.log('Created MR TOH DIDYMUS ANKINIMBOM');
    } else {
      trainerToh.name = 'MR TOH DIDYMUS ANKINIMBOM';
      trainerToh.role = 'teacher';
      trainerToh.isActive = true;
      await trainerToh.save();
      console.log('Updated MR TOH DIDYMUS ANKINIMBOM to teacher role');
    }

    // 3. Set yongireneaus@gmail.com to teacher role
    let trainerYong = await User.findOne({ email: 'yongireneaus@gmail.com' });
    if (!trainerYong) {
      trainerYong = await User.create({
        name: 'MR YONG IREANUS',
        email: 'yongireneaus@gmail.com',
        role: 'teacher',
        password: 'password123',
        isActive: true
      });
      console.log('Created MR YONG IREANUS');
    } else {
      trainerYong.name = 'MR YONG IREANUS';
      trainerYong.role = 'teacher';
      trainerYong.isActive = true;
      await trainerYong.save();
      console.log('Updated MR YONG IREANUS to teacher role');
    }

    // 4. Update any other teachers to student role to ensure only these two are the main teachers
    const otherTeachersResult = await User.updateMany(
      { 
        email: { $nin: ['toh@gmail.com', 'yongireneaus@gmail.com'] }, 
        role: 'teacher' 
      },
      { $set: { role: 'student' } }
    );
    console.log(`Re-assigned ${otherTeachersResult.modifiedCount} other teachers to student role.`);

    // 5. Delete and re-seed subjects, distributing them between these two trainers
    await Subject.deleteMany({});
    console.log('Cleared all subjects.');

    const trainers = [trainerToh, trainerYong];

    for (let i = 0; i < officialSubjects.length; i++) {
      const sub = officialSubjects[i];
      const assignedTrainer = trainers[i % trainers.length];
      
      await Subject.create({
        name: sub.name,
        code: sub.code,
        teacher: assignedTrainer._id,
        isActive: true
      });
      console.log(`Created subject: [${sub.name}] (${sub.code}) assigned to: [${assignedTrainer.name}]`);
    }

    console.log('Database synchronization completed successfully.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
  }
};

updateTrainersAndSubjects();
