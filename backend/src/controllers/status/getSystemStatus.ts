import { Request, Response } from 'express';

/**
 * Check overall system status
 * @route GET /api/status
 * @access Public
 */
export const getSystemStatus = (req: Request, res: Response) => {
    const nodeVersion = process.version;
    const expressVersion = require('express/package.json').version;

    return res.status(200).json({
        status: 'success',
        message: 'system is operational',
        versions: {
            node: nodeVersion,
            express: expressVersion,
        },
        environment: process.env.NODE_ENV || 'development'
    });
};
