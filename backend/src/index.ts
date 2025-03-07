import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

// load environment variables
dotenv.config();

// create express app
const app = express();
const port = process.env.PORT || 5000;

// connect to mongodb
connectDB();

// cors configuration - allow any localhost port during development
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
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
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
}); 