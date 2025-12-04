import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { startEmailWorker } from './services/email/queue';

// load environment variables
dotenv.config();

// create express app
const app = express();
const port = process.env.PORT || 5000;

// connect to mongodb
connectDB();

// start email queue worker
startEmailWorker();

// cors configiuration
const isProduction = process.env.NODE_ENV === 'production';
const corsOptions = {
  // in development, allow all localhost and 127.0.0.1 requests
  // in production, this would be replaced with specific allowed origins
  origin: isProduction 
    ? process.env.ALLOWED_ORIGINS?.split(',') || [] 
    : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      // allow all localhost and 127.0.0.1 requests in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// routes
app.use('/api', routes);

// simple test route at root
app.get('/', (req, res) => {
  res.json({ message: 'server is running' });
});

// error middleware
app.use(notFound);
app.use(errorHandler);

// start server
app.listen(port, () => {
  console.log(`server running on port ${port} (http://localhost:${port})`);
  console.log(`CORS enabled for: ${isProduction ? process.env.ALLOWED_ORIGINS || 'specific origins' : 'all localhost origins'}`);
}); 