/**
 * Authentication Types
 * Contains all TypeScript interfaces and enums for authentication
 */

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
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Password reset request body (forgot password flow - no current password)
 */
export interface ResetPasswordRequest {
    newPassword: string;
    confirmPassword: string;
}

/**
 * Password reset response
 */
export interface ResetPasswordResponse {
    success: true;
    message: string;
    data: {
        user: User;
    };
}

/**
 * Verify password reset code request
 */
export interface VerifyPasswordResetCodeRequest {
    code: string;
}

/**
 * Verify password reset code response
 */
export interface VerifyPasswordResetCodeResponse {
    success: true;
    message: string;
    data: {
        user: User;
    };
}