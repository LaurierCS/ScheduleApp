/**
 * Authentication API Service
 * Handles all authentication-related API calls to the backend
 */

import { authenticatedFetch } from '../utils/authClient';
import {
  setTokens,
  getRefreshToken,
  clearTokens,
  updateAccessToken,
  getAccessToken,
  hasValidToken,
} from '../utils/tokenStorage';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  MeResponse,
  RefreshResponse,
  ErrorResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyPasswordResetCodeRequest,
  VerifyPasswordResetCodeResponse,
} from '../types/authTypes';

// Re-export types and utilities for backward compatibility
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  MeResponse,
  RefreshResponse,
  ErrorResponse,
};
export { UserRole } from '../types/authTypes';
export { setTokens, getAccessToken, getRefreshToken, clearTokens, hasValidToken };

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Register a new user account
 * @param data - User registration data (name, email, password)
 * @returns Promise with auth response including user and tokens
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await authenticatedFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const result: AuthResponse = await response.json();
  setTokens(result.data.accessToken, result.data.refreshToken);

  return result;
};

/**
 * Authenticate user with email and password
 * @param data - Login credentials
 * @returns Promise with auth response including user and tokens
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await authenticatedFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const result: AuthResponse = await response.json();
  setTokens(result.data.accessToken, result.data.refreshToken);

  return result;
};

/**
 * Get current authenticated user information
 * @returns Promise with user data
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await authenticatedFetch('/auth/me', {
    method: 'GET',
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to get user info');
  }

  const result: MeResponse = await response.json();
  return result.data.user;
};

/**
 * Refresh the access token using refresh token
 * @returns Promise with new access token
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await authenticatedFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Session expired. Please login again.');
  }

  const result: RefreshResponse = await response.json();
  updateAccessToken(result.data.accessToken);

  return result.data.accessToken;
};

/**
 * Logout user and revoke tokens on backend
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  try {
    await authenticatedFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};
// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Reset user password (requires authentication)
 * @param data - Current password and new password
 * @returns Promise with user data
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await authenticatedFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to reset password');
  }

  const result: ResetPasswordResponse = await response.json();
  return result;
};

/**
 * Verify password reset code (step 2 - actually update password)
 * @param data - 6-digit verification code
 * @returns Promise with user data
 */
export const verifyPasswordResetCode = async (data: VerifyPasswordResetCodeRequest): Promise<VerifyPasswordResetCodeResponse> => {
  const response = await authenticatedFetch('/auth/verify-password-reset-code', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Invalid verification code');
  }

  const result: VerifyPasswordResetCodeResponse = await response.json();
  return result;
};

/**
 * Default export providing all auth API functions
 */
const authApi = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  resetPassword,
  verifyPasswordResetCode,
};

export default authApi;

