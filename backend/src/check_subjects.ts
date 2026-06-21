import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/subject';

dotenv.config();

const checkSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string);
        console.log('Connected to MongoDB');

        const subjects = await Subject.find({});
        console.log('--- Subjects in Database ---');
        subjects.forEach(s => {
            console.log(`Name: [${s.name}], Code: [${s.code}], Active: [${s.isActive}]`);
        });
        console.log('-------------------------');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkSubjects();
