import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Router } from 'express';

// importing status routes
import statusRoutes from './statusRoutes';
import authRoutes from './authRoutes';
import availabilityRoutes from './availabilityRoutes';
import groupRoutes from './groupRoutes';
import meetingRoutes from './meetingRoutes';
import teamRoutes from './teamRoutes';
import userRoutes from './userRoutes';
import interviewerRoutes from './interviewerRoutes';
import candidateRoutes from './candidateRoutes';
import scheduleRoutes from './scheduleRoutes';

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
  console.log('environment variables check endpoint hit');
  
  // required env variables
  const requiredVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  res.status(200).json({
    valid: missingVars.length === 0,
    missing: missingVars.length > 0 ? missingVars : undefined,
    total: requiredVars.length,
    present: requiredVars.length - missingVars.length
  });
});

// test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'test endpoint working' });
});

// mounting status routes
router.use('/status', statusRoutes);

router.use('/auth', authRoutes);
router.use('/availability', availabilityRoutes);
router.use('/groups', groupRoutes);
router.use('/meetings', meetingRoutes);
router.use('/teams', teamRoutes);
router.use('/users', userRoutes);
router.use('/interviewers', interviewerRoutes);
router.use('/candidates', candidateRoutes);
router.use('/schedule', scheduleRoutes);

export default router; 