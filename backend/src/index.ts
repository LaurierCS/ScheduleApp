import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';

// load environment variables
dotenv.config();

const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// connect to mongodb
connectDB();

// start server
app.listen(port, () => {
  console.log(`server running on port ${port} (http://localhost:${port})`);
  console.log(`CORS enabled for: ${isProduction ? process.env.ALLOWED_ORIGINS || 'specific origins' : 'all localhost origins'}`);
}); 