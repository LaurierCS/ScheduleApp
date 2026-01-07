/**
 * Authentication Hooks
 * All auth-related custom hooks for easy component integration
 */

import React from 'react';
import { AuthContext, AuthContextType } from '../services/AuthContext';
import { User, UserRole } from '../services/authApi';

// ============================================================================
// MAIN AUTH HOOK
// ============================================================================

/**
 * Custom hook to use auth context
 * Makes it easy to access auth state and methods in any component
 * 
 * Usage in components:
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get the current user
 * Returns null if not logged in
 * 
 * Usage in components:
 * const user = useUser();
 */
export const useUser = (): User | null => {
    const { user } = useAuth();
    return user;
};

/**
 * Hook to check if user is authenticated
 * 
 * Usage in components:
 * const isAuthenticated = useIsAuthenticated();
 */
export const useIsAuthenticated = (): boolean => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
};

/**
 * Hook to check if current user has a specific role
 * 
 * Usage in components:
 * const isCandidate = useHasRole(UserRole.CANDIDATE);
 */
export const useHasRole = (role: UserRole): boolean => {
    const { user } = useAuth();
    return user?.role === role;
};

/**
 * Hook to check if current user is admin
 * 
 * Usage in components:
 * const isAdmin = useIsAdmin();
 */
export const useIsAdmin = (): boolean => {
    return useHasRole(UserRole.ADMIN);
};
