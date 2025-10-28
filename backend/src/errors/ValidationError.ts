import { CustomError } from './CustomError';

/**
 * Validation error class
 * Used when request data fails validation (invalid format, missing required fields, etc.)
 */
export class ValidationError extends CustomError {
    public details?: any;

    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}
