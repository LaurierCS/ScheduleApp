import express from 'express';
import mongoose from 'mongoose';
import { Router } from 'express';
import { config } from "../config/env.config";

// importing status routes
import statusRoutes from './statusRoutes';

const router = Router();

// api root route - returns general api info
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'api is running',
    version: '1.0.0',
    endpoints: {
      '/health': 'basic health check',
      '/test': 'test endpoint',
      '/status': 'system status check',
      '/status/db': 'database connection status'
    }
  });
});

// health check route
router.get('/health', (req, res) => {
  console.log('health check endpoint hit');
  res.status(200).json({ status: 'ok' });
});

// mongodb status check
router.get('/db-status', (req, res) => {
  console.log('mongodb status check endpoint hit');

  try {
    const state = mongoose.connection.readyState;
    /*
      0 = disconnected
      1 = connected
      2 = connecting
      3 = disconnecting
    */

    let status: {
      connected: boolean;
      state: string;
      dbName?: string;
      error?: string;
    } = {
      connected: false,
      state: 'unknown',
    };

    switch(state) {
      case 0:
        status.state = 'disconnected';
        status.error = 'Not connected to MongoDB';
        break;
      case 1:
        status.connected = true;
        status.state = 'connected';
        if (mongoose.connection.db) {
          status.dbName = mongoose.connection.db.databaseName;
        }
        break;
      case 2:
        status.state = 'connecting';
        status.error = 'Still connecting to MongoDB';
        break;
      case 3:
        status.state = 'disconnecting';
        status.error = 'Disconnecting from MongoDB';
        break;
    }

    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// env variables check
router.get('/env-check', (req, res) => {
  // Config is already validated at startup
  res.status(200).json({
    valid: true,
    message: "All environment variables are valid",
    config: {
      port: config.port,
      nodeEnv: config.nodeEnv,
      mongodb: {
        // finds "//username:password@" and replaces with "//<credentials>@"
        uri: config.mongodb.uri.replace(/\/\/.*@/, "//<credentials>@"),
      }, // Hide credentials
      jwt: { expiresIn: config.jwt.expiresIn },
      cors: { allowedOrigins: config.cors.allowedOrigins },
      email: {
        service: config.email.service,
        user: config.email.user,
        pass: "***hidden***",
      },
    },
  });
});

// test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'test endpoint working' });
});

// mounting status routes
router.use('/status', statusRoutes);

export default router;