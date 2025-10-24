import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { config, isProduction } from './config/env.config';

// create express app
const app = express();

// connect to mongodb
connectDB();

// cors configiuration
const corsOptions = {
  // in development, allow all localhost and 127.0.0.1 requests
  // in production, this would be replaced with specific allowed origins
  origin: isProduction()
    ? config.cors.allowedOrigins
    : (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
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
app.listen(config.port, () => {
  console.log(
    `server running on port ${config.port} (http://localhost:${config.port})`
  );
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(
    `CORS enabled for: ${
      isProduction()
        ? config.cors.allowedOrigins.join(", ") || "specific origins"
        : "all localhost origins"
    }`
  );
});
