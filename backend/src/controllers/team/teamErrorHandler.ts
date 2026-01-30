import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware for team routes
 * Handles Zod validation errors and Mongoose validation errors
 */
export const teamErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Handle Zod validation errors
    if (err?.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            issues: err.issues,
        });
    }

    // Handle Mongoose validation errors
    if (err?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.errors,
        });
    }

    // Handle authorization errors
    if (err?.message?.includes('Access denied') || err?.message?.includes('permission')) {
        return res.status(403).json({
            success: false,
            error: err.message || 'Access denied',
        });
    }

    // Log unexpected errors
    console.error('Team routes error:', err);

    // Handle all other errors
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
};
