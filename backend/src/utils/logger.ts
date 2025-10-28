/**
 * Simple logger utility for error handling
 * Provides structured logging with different levels and prevents sensitive data exposure
 */

/**
 * Sanitizes error objects to remove sensitive information before logging
 * @param error - The error object to sanitize
 * @returns Sanitized error object safe for logging
 */
const sanitizeError = (error: any): any => {
    const sanitized: any = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
    };

    // Only include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        sanitized.stack = error.stack;
    }

    // Include operational flag if present
    if (error.isOperational !== undefined) {
        sanitized.isOperational = error.isOperational;
    }

    // Include validation details if present (but sanitize sensitive fields)
    if (error.details) {
        sanitized.details = sanitizeObject(error.details);
    }

    return sanitized;
};

/**
 * Sanitizes objects to remove sensitive fields like passwords, tokens, etc.
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
    const sanitized = { ...obj };

    Object.keys(sanitized).forEach(key => {
        // Remove sensitive fields
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        }
        // Recursively sanitize nested objects
        else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    });

    return sanitized;
};

/**
 * Logs error information to the console
 * In production, this would be replaced with a proper logging service
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export const logError = (error: any, context?: string): void => {
    const sanitizedError = sanitizeError(error);

    const logEntry = {
        level: 'ERROR',
        context: context || 'Unknown',
        ...sanitizedError,
    };

    // In production, you would send this to a logging service
    // For now, we'll use console.error
    console.error('Error logged:', JSON.stringify(logEntry, null, 2));
};

/**
 * Logs warning information to the console
 * @param message - The warning message
 * @param context - Additional context
 */
export const logWarning = (message: string, context?: any): void => {
    const sanitizedContext = context ? sanitizeObject(context) : undefined;

    console.warn('Warning:', {
        level: 'WARNING',
        message,
        context: sanitizedContext,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Logs info level messages
 * @param message - The info message
 * @param context - Additional context
 */
export const logInfo = (message: string, context?: any): void => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Info:', {
            level: 'INFO',
            message,
            context,
            timestamp: new Date().toISOString(),
        });
    }
};
