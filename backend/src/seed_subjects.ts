import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/subject';
import User from './models/user';

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
];

const seedSubjects = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error('MONGO_URL is not defined in the environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Fetch teachers to assign to subjects
    const teachers = await User.find({ role: 'teacher' });
    console.log(`Found ${teachers.length} teachers to assign.`);

    // Delete all existing subjects to avoid code uniqueness conflicts
    const deleteResult = await Subject.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing subjects.`);

    // Insert new subjects
    for (let i = 0; i < officialSubjects.length; i++) {
      const sub = officialSubjects[i];
      // Distribute subjects among available teachers if any
      const teacherId = teachers.length > 0 ? teachers[i % teachers.length]._id : null;
      
      await Subject.create({
        name: sub.name,
        code: sub.code,
        teacher: teacherId,
        isActive: true
      });
      console.log(`Created subject: [${sub.name}] (${sub.code}) assigned to teacher: [${teacherId || 'None'}]`);
    }

    console.log('Successfully seeded official subjects.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedSubjects();
