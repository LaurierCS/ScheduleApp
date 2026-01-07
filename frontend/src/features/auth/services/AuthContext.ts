/**
 * Authentication Context
 * Core context definition for managing global authentication state
 */

import { createContext } from 'react';
import { User, UserRole } from './authApi';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Authentication state and methods available to all components
 */
export interface AuthContextType {
    // State
    user: User | null;                    // Current logged-in user (null if not logged in)
    isAuthenticated: boolean;             // Quick check: is user logged in?
    isLoading: boolean;                   // Is auth operation in progress?
    error: string | null;                 // Any error message to display

    // Methods
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    clearError: () => void;               // Clear error message
}

/**
 * Props for AuthProvider component
 */
export interface AuthProviderProps {
    children: React.ReactNode;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

/**
 * Create the context with undefined as default
 * (Will be properly initialized by AuthProvider)
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export UserRole for convenience
export { UserRole };
