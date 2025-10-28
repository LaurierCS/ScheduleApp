import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors';
import { logError, logWarning } from '../utils/logger';

/**
 * Standard error response format
 * Ensures all errors follow the same structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Not found error handler middleware
 * Catches all requests to undefined routes and passes to error handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  logWarning(`Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler middleware
 * Catches all errors, formats them consistently, and logs them appropriately
 * This should be the last middleware in the chain
 */
export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Determine if this is a custom error or a generic error
  const isCustomError = err instanceof CustomError;

  // Extract error details
  const statusCode = isCustomError
    ? (err as CustomError).statusCode
    : res.statusCode !== 200
      ? res.statusCode
      : 500;

  const errorCode = isCustomError
    ? (err as CustomError).code
    : statusCode === 404
      ? 'NOT_FOUND'
      : 'INTERNAL_SERVER_ERROR';

  // Log the error with context
  logError(err, `${req.method} ${req.path}`);

  // Build standardized error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
    },
  };

  // Include validation details if present (only for ValidationError)
  if (isCustomError && (err as any).details) {
    errorResponse.error.details = (err as any).details;
  }

  // In development, include stack trace for debugging
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse.error as any).stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to automatically catch errors and pass to error middleware
 * This eliminates the need for try-catch blocks in every async route
 * 
 * Usage:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   // Your async code here
 * }));
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 