import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/models/complaint.ts'; 

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const complaint = await Complaint.create({
      studentId: new mongoose.Types.ObjectId(),
      targetId: undefined,
      title: 'Smoke in Room 101',
      description: 'Test',
      category: 'Facilities',
      priority: 'High',
      aiCategory: 'Safety',
      aiSeverity: 'Critical',
      aiPriorityScore: 99,
      aiSuggestedAction: 'Evacuate',
      aiSuggestedReply: 'Working on it',
      aiConfidenceScore: 90
    });
    console.log("Success!", complaint._id);
  } catch (err) {
    console.error("MONGOOSE ERROR:", err.message);
  }
  process.exit(0);
}
run();
EOF
bun run test_complaint_post2.js
