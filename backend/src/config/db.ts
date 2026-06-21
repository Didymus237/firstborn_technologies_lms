import mongoose from 'mongoose';

//connect to database
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL as string, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        }); 
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // Use the MONGO_URI from environment variables 
    }    catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1); // Exit the process with an error code
    }
}

export default connectDB;