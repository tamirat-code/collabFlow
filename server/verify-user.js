import mongoose from 'mongoose';
import User from './models/User.js';

async function verifyUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/collabflow');
    
    
    const user = await User.findOneAndUpdate(
      { email: 'testverify@example.com' },
      { isEmailVerified: true },
      { returnDocument: 'after' }
    );
    
    if (user) {
      console.log('✅ User email verified successfully');
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
