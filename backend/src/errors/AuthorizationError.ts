import { CustomError } from './CustomError';

/**
 * Authorization error class
 * Used when user lacks permissions to access a resource (insufficient role, not team member, etc.)
 */
export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied: insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}