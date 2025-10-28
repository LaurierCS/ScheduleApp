import { CustomError } from './CustomError';

/**
 * Authentication error class
 * Used when user authentication fails (invalid credentials, missing token, etc.)
 */
export class AuthenticationError extends CustomError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
