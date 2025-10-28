import { CustomError } from './CustomError';

/**
 * Not found error class
 * Used when a requested resource cannot be found
 */
export class NotFoundError extends CustomError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
