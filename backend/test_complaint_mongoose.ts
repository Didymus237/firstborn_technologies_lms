import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/models/complaint'; 
dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  let aiInsights: any = {};
  
  const targetId = undefined;

  const complaint = await Complaint.create({
      studentId: new mongoose.Types.ObjectId(),
      targetId: targetId ? new mongoose.Types.ObjectId(targetId) : undefined,
      title: "Test Complaint",
      description: "Test Description",
      category: "Academic",
      priority: "Low",
      ...aiInsights
  });

  console.log("Successfully created complaint ID:", complaint._id);
} catch (err) {
  console.error("FATAL MONGOOSE ERROR:", err);
} finally {
  await mongoose.disconnect();
}
EOF
bun run test_complaint_mongoose.ts
