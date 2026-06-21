import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './models/class';
import Subject from './models/subject';
import User from './models/user';
import AcademicYear from './models/academicYear';

dotenv.config();

const recreateClasses = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error('MONGO_URL is not set');
      process.exit(1);
    }
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // 1. Clear old studentClass associations on Users
    const clearResult = await User.updateMany({}, { $set: { studentClass: null } });
    console.log(`Cleared class association on ${clearResult.modifiedCount} users.`);

    // 2. Remove all existing classes
    const deleteResult = await Class.deleteMany({});
    console.log(`Deleted all ${deleteResult.deletedCount} existing classes from database.`);

    // 3. Find current Academic Year
    let activeYear = await AcademicYear.findOne({ iscurrent: true });
    if (!activeYear) {
      activeYear = await AcademicYear.findOne({});
    }
    if (!activeYear) {
      activeYear = await AcademicYear.create({
        name: "2025-2026",
        fromYear: new Date("2025-09-01"),
        toYear: new Date("2026-06-30"),
        iscurrent: true
      });
      console.log('No Academic Year found. Created default: 2025-2026');
    } else {
      console.log(`Using Academic Year: ${activeYear.name}`);
    }

    // 4. Retrieve all subjects
    const subjects = await Subject.find({});
    console.log(`Retrieved ${subjects.length} subjects to map classes for.`);

    // 5. Generate a matching class for each subject
    for (const sub of subjects) {
      // Map beautiful class names to match the courses
      const className = `${sub.name} Class`;
      const teacherId = sub.teacher || null;

      const newClass = await Class.create({
        name: className,
        academicYear: activeYear._id,
        classTeacher: teacherId,
        students: [],
        subjects: [sub._id],
        capacity: 40
      });

      console.log(`Created Class: [${newClass.name}] assigned to Teacher ID: [${teacherId || "Unassigned"}]`);
    }

    console.log('Successfully completed classes realignment.');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Migration error:', err);
  }
};

recreateClasses();
