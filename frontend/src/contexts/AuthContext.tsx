/**
 * Authentication Context
 * Manages global authentication state and provides auth methods to all components
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  clearTokens,
  hasValidToken,
} from '../utils/authApi';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Authentication state and methods available to all components
 */
interface AuthContextType {
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
interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

/**
 * Create the context with undefined as default
 * (Will be properly initialized by AuthProvider)
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

/**
 * AuthProvider Component
 * Wraps your app and provides authentication state to all children
 * 
 * Usage in main.tsx or App.tsx:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with true to check existing session
  const [error, setError] = useState<string | null>(null);
  
  // Computed value: user is authenticated if user object exists
  const isAuthenticated = !!user;

  // ============================================================================
  // EFFECT: CHECK FOR EXISTING SESSION ON MOUNT
  // ============================================================================
  
  /**
   * When app loads, check if user has a valid token
   * If yes, fetch user data and restore session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a token in localStorage
      if (!hasValidToken()) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to get current user info with the stored token
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        // Token is invalid or expired, clear it
        console.error('Failed to restore session:', err);
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Run once on mount

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

  /**
   * Login user with email and password
   * Returns the logged-in user data
   */
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the API
      const response = await apiLogin({ email, password });
      
      // Update state with user data
      setUser(response.data.user);
      
      console.log('Login successful:', response.data.user);
      
      // Return the user data so component can use it immediately
      return response.data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err; // Re-throw so component can handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user
   * Returns the newly created user data
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the API
      const response = await apiRegister({ name, email, password });
      
      // Update state with user data
      setUser(response.data.user);
      
      console.log('Registration successful:', response.data.user);
      
      // Return the user data so component can use it immediately
      return response.data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err; // Re-throw so component can handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear all auth data
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call API to revoke tokens on backend
      await apiLogout();
      
      // Clear user state
      setUser(null);
      setError(null);
      
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, still clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear any error message
   */
  const clearError = (): void => {
    setError(null);
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  /**
   * Everything we want to expose to consuming components
   */
  const value: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Methods
    login,
    register,
    logout,
    clearError,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK: useAuth
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
// HELPER HOOKS (Optional but useful)
// ============================================================================

/**
 * Hook to get the current user
 * Returns null if not logged in
 */
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook to check if current user has a specific role
 */
export const useHasRole = (role: UserRole): boolean => {
  const { user } = useAuth();
  return user?.role === role;
};

/**
 * Hook to check if current user is admin
 */
export const useIsAdmin = (): boolean => {
  return useHasRole(UserRole.ADMIN);
};

