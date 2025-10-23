import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from "../config/env.config";

const router = Router();

// route to check mongodb connection status
router.get('/db', async (req, res) => {
  try {
    // check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        status: 'error', 
        message: 'database not connected',
        readyState: mongoose.connection.readyState 
      });
    }

    // get connection details
    let dbName = 'unknown';
    if (mongoose.connection.db) {
      dbName = mongoose.connection.db.databaseName;
    }

    // respond with success
    return res.status(200).json({
      status: 'success',
      message: 'database connected',
      dbName,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('db status check error:', error);
    return res.status(500).json({
      status: 'error', 
      message: 'failed to check database status'
    });
  }
});

// route to check overall system status
router.get('/', (req, res) => {
  const nodeVersion = process.version;
  const expressVersion = require('express/package.json').version;

  return res.status(200).json({
    status: 'success',
    message: 'system is operational',
    versions: {
      node: nodeVersion,
      express: expressVersion,
    },
    environment: config.nodeEnv,
  });
});

export default router;