/**
 * Token Storage Utilities
 * Manages JWT tokens in localStorage with a clean, simple API
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ============================================================================
// TOKEN STORAGE FUNCTIONS
// ============================================================================

/**
 * Store both access and refresh tokens in localStorage
 * @param accessToken - JWT access token from authentication
 * @param refreshToken - JWT refresh token for renewing access
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Retrieve the access token from localStorage
 * @returns The access token if it exists, null otherwise
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Retrieve the refresh token from localStorage
 * @returns The refresh token if it exists, null otherwise
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Update only the access token in localStorage
 * Used after token refresh to update access token without changing refresh token
 * @param accessToken - New JWT access token
 */
export const updateAccessToken = (accessToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

/**
 * Clear all tokens from localStorage
 * Should be called on logout or when tokens are invalid
 */
export const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user has a valid access token stored
 * @returns true if an access token exists, false otherwise
 */
export const hasValidToken = (): boolean => {
    return !!getAccessToken();
};
