/**
 * Authentication API Service
 * Handles all authentication-related API calls to the backend
 */

import { getApiUrl } from '../../../utils/api';

// ============================================================================
// TYPESCRIPT INTERFACES - Define the shape of our data
// ============================================================================

/**
 * User roles that match the backend enum
 */
export enum UserRole {
  ADMIN = 'admin',
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'candidate',
}

/**
 * User object structure from backend
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  groupIds?: string[];
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request body
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Successful auth response from backend
 */
export interface AuthResponse {
  success: true;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Current user response from /auth/me
 */
export interface MeResponse {
  success: true;
  data: {
    user: User;
  };
}

/**
 * Token refresh response
 */
export interface RefreshResponse {
  success: true;
  message: string;
  data: {
    accessToken: string;
  };
}

/**
 * Generic error response from backend
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{ field?: string; message: string }>;
}

// ============================================================================
// TOKEN STORAGE HELPERS - Manage JWT tokens in localStorage
// ============================================================================

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all tokens from localStorage (used on logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user has a valid access token
 */
export const hasValidToken = (): boolean => {
  return !!getAccessToken();
};

// ============================================================================
// API HELPER FUNCTION - Makes authenticated requests
// ============================================================================

/**
 * Helper function to make authenticated API requests
 * Automatically adds the Authorization header with JWT token
 */
const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAccessToken();

  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    // Create a new Headers instance to fix types and safely add custom headers
    const mutableHeaders = new Headers(headers);
    mutableHeaders.set('Authorization', `Bearer ${token}`);
    headers = mutableHeaders;
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
  });

  return response;
};

// ============================================================================
// AUTHENTICATION API FUNCTIONS
// ============================================================================

/**
 * Register a new user
 * POST /api/auth/register
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

  // Store tokens after successful registration
  setTokens(result.data.accessToken, result.data.refreshToken);

  return result;
};

/**
 * Login with email and password
 * POST /api/auth/login
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

  // Store tokens after successful login
  setTokens(result.data.accessToken, result.data.refreshToken);

  return result;
};

/**
 * Get current user info
 * GET /api/auth/me
 * Requires authentication
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
 * POST /api/auth/refresh
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
    // If refresh fails, clear tokens and throw error
    clearTokens();
    throw new Error('Session expired. Please login again.');
  }

  const result: RefreshResponse = await response.json();

  // Update only the access token
  localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);

  return result.data.accessToken;
};

/**
 * Logout user and revoke tokens
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  try {
    // Try to revoke the token on the backend
    await authenticatedFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    // Even if backend call fails, we still clear local tokens
    console.error('Logout error:', error);
  } finally {
    // Always clear tokens from localStorage
    clearTokens();
  }
};
// ============================================================================
// EXPORT DEFAULT OBJECT (Alternative usage pattern)
// ============================================================================

/**
 * You can also import like: import authApi from './authApi'
 * Then use: authApi.login(), authApi.register(), etc.
 */
const authApi = {
  // Auth functions
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,

  // Token management
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasValidToken,
};

export default authApi;

