import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mockUserId = new mongoose.Types.ObjectId().toString();
const token = jwt.sign({ id: mockUserId, role: 'student' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

async function test() {
  try {
    const res = await axios.post('http://localhost:8001/api/complaints', {
      title: 'Broken Light',
      description: 'The light is flickering',
      category: 'Facilities',
      priority: 'Low'
    }, {
      headers: {
        Cookie: `jwt=${token}`
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("API RETURNED FATAL ERROR:", err.response.data);
    } else {
      console.log("NETWORK ERROR:", err.message);
    }
  }
}
test();
EOF
node test_complaint_request_2.js
