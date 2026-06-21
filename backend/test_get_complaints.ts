import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/models/complaint';
dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const complaints = await Complaint.find({});
  console.log(`Found ${complaints.length} complaints.`);
} catch (e) {
  console.error(e);
} finally {
  await mongoose.disconnect();
}
EOF
bun run test_get_complaints.ts
