import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/models/complaint.js'; // Might need .ts extension if using bun

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const complaints = await Complaint.find({}).limit(1).lean();
  console.log("Complaint shape:", JSON.stringify(complaints, null, 2));
  process.exit(0);
}
run();
EOF
bun run test_complaints.js
