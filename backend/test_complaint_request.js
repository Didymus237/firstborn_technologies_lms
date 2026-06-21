import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8001/api' });

// We need a valid JWT. We can extract it by logging in or issuing a token directly.
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function generateAuthToken(userId, role) {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return `jwt=${token};`;
}

// Generate an invalid/mock MongoID
import mongoose from 'mongoose';
const fakeStudentId = new mongoose.Types.ObjectId().toString();

async function test() {
  try {
    const res = await api.post('/complaints', {
      title: 'Mock Error Test',
      description: 'Is it failing?',
      category: 'Academic',
      priority: 'Low'
    }, {
      headers: { Cookie: generateAuthToken(fakeStudentId, 'student') }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("API RETURNED FATAL ERROR:", err.response.data);
    } else {
      console.error("AXIOS FATAL ERROR:", err.message);
    }
  }
  process.exit(0);
}
test();
EOF
node test_complaint_request.js
