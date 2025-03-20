import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to database');
    
    // update users without a role, setting default role as candidate
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: UserRole.CANDIDATE } }
    );
    
    console.log(`Migration completed. Updated ${result.modifiedCount} users.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

migrateUsers();
