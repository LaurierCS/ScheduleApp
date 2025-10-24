import mongoose from 'mongoose';
import { config } from './env.config';

// connection function
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`mongodb connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;