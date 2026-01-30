import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Check MongoDB connection status
 * @route GET /api/status/db
 * @access Public
 */
export const getDbStatus = async (req: Request, res: Response) => {
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
};
