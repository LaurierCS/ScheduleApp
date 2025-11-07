import { CustomError } from './CustomError';

/**
 * Authorization error class
 * Used when user lacks permissions to access a resource
 * This is distinct from AuthenticationError:
 * - AuthenticationError: User identity cannot be verified (not logged in, invalid token)
 * - AuthorizationError: User identity is verified but lacks permissions (insufficient role, not team member, etc.)
 * 
 * HTTP Status: 403 Forbidden
 */
export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied: insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}
