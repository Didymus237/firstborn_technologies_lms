import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/user';

dotenv.config(); // Assuming it runs from backend dir


const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role isActive name');
        console.log('--- Users in Database ---');
        users.forEach(u => {
            console.log(`Email: [${u.email}], Name: [${u.name}], Role: [${u.role}], Active: [${u.isActive}]`);
        });
        console.log('-------------------------');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
