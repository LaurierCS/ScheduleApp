/**
 * Navigation utilities for role-based routing
 */

import { UserRole } from '../features/auth/services/authApi';

/**
 * Get the dashboard path for a specific user role
 */
export const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.INTERVIEWER:
      return '/interviewer/dashboard';
    case UserRole.CANDIDATE:
      return '/candidate/dashboard';
    default:
      return '/home'; // Fallback
  }
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

