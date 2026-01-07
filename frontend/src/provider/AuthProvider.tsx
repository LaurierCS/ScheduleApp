/**
 * Authentication Provider Component
 * Wraps your app and provides authentication state to all children
 * 
 * Usage in main.tsx or App.tsx:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */

import React, { useState, useEffect } from 'react';
import { AuthContext, AuthContextType, AuthProviderProps } from '../features/auth/services/AuthContext';
import {
  User,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  clearTokens,
  hasValidToken,
} from '../features/auth/services/authApi';

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

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
