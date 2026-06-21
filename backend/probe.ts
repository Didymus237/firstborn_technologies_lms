import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function probe() {
  const uri = process.env.MONGO_URL;
  console.log('--- Database Probe ---');
  if (!uri) {
    console.error('ERROR: MONGO_URL not found in .env');
    return;
  }
  console.log('Attempting to connect to Atlas...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connection established!');
    process.exit(0);
  } catch (err: any) {
    console.error('FAILURE: Could not connect.');
    if (err.name === 'MongooseServerSelectionError') {
      console.error('\nREASON: Your current IP is likely NOT whitelisted in MongoDB Atlas.');
      console.error('Follow this guide: https://www.mongodb.com/docs/atlas/security-whitelist/');
    } else {
      console.error('ERROR DETAILS:', err.message);
    }
    process.exit(1);
  }
}

probe();
