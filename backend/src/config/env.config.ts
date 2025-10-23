import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/*
 * Config interface for env variables
 */
interface Config {
  port: number;
  nodeEnv: string;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  email: {
    service: string;
    user: string;
    pass: string;
  };
}

/**
 * Validates that all required env variables are present
 * Throws an error if any are missing
 */
function validateConfig(): Config {
  // List of required environment variables
  const requiredEnvVars = [
    "PORT",
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "NODE_ENV",
    "EMAIL_SERVICE",
    "EMAIL_USER",
    "EMAIL_PASS",
  ];

  // Check for missing required variables
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  // Throw error if atleast one env variable is missing
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n`
    );
  }

  // Parse and validate PORT
  const port = parseInt(process.env.PORT!, 10);
  if (isNaN(port) || port < 0 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${process.env.PORT}. Must be a number between 0 and 65535.`
    );
  }

  // Build the configuration object
  const config: Config = {
    port,
    nodeEnv: process.env.NODE_ENV!.trim(),
    mongodb: {
      uri: process.env.MONGODB_URI!.trim(),
    },
    jwt: {
      secret: process.env.JWT_SECRET!.trim(),
      expiresIn: process.env.JWT_EXPIRES_IN!.trim(),
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
        : [],
    },
    email: {
      service: process.env.EMAIL_SERVICE!.trim(),
      user: process.env.EMAIL_USER!.trim(),
      pass: process.env.EMAIL_PASS!.trim(),
    },
  };

  return config;
}

// Validate and export configuration
export const config = validateConfig();

// Export helper functions for environment checks
export const isDevelopment = (): boolean => config.nodeEnv === "development";
export const isProduction = (): boolean => config.nodeEnv === "production";
export const isTest = (): boolean => config.nodeEnv === "test";
