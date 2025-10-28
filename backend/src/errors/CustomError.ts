/**
 * Base custom error class that all other error classes extend from
 * Provides a standardized structure for error handling
 */
export class CustomError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Operational errors are expected errors (vs programming errors)

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}
