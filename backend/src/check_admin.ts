
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
});

const User = mongoose.model('User', UserSchema);

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).select('email role name');
    console.log(`Found ${users.length} total user(s):`);
    users.forEach(u => console.log(` - ${u.email} (${u.role}) ${u.name || ''}`));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAdmin();
