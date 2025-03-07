import mongoose from 'mongoose';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

// connection function
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`mongodb connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 