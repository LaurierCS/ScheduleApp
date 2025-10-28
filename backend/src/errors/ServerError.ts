import { CustomError } from './CustomError';

/**
 * Server error class
 * Used for internal server errors (database errors, service failures, etc.)
 */
export class ServerError extends CustomError {
    constructor(message: string = 'Internal server error') {
        super(message, 500, 'SERVER_ERROR');
    }
}
