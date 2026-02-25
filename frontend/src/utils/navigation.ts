/**
 * Navigation utilities for role-based routing
 */

import { UserRole } from '../features/auth/services/authApi';

/**
 * Get the dashboard path for a specific user role
 * All authenticated users go to the same /dashboard route
 * The Dashboard component handles role-specific content rendering
 */
export const getDashboardPath = (): string => {
  // All roles go to the same dashboard - role-specific content is handled by the Dashboard component
  return '/dashboard';
};

/**
 * Get a user-friendly role name
 */
export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.INTERVIEWER:
      return 'Interviewer';
    case UserRole.CANDIDATE:
      return 'Candidate';
    default:
      return 'User';
  }
};

