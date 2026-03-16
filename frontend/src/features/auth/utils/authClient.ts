/**
 * Authenticated HTTP Client
 * Provides a fetch wrapper that automatically includes JWT authentication headers
 * and handles token refresh on 401 responses.
 */

import { getApiUrl } from '../../../utils/api';
import { getAccessToken, getRefreshToken, updateAccessToken, clearTokens } from '../utils/tokenStorage';

// ============================================================================
// AUTHENTICATED FETCH
// ============================================================================

const buildHeaders = (token: string | null, extra?: HeadersInit): Headers => {
    const headers = new Headers({ 'Content-Type': 'application/json', ...(extra as Record<string, string> || {}) });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
};

/**
 * Makes an authenticated HTTP request to the API.
 * On a 401, attempts a token refresh and retries once.
 */
export const authenticatedFetch = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = getAccessToken();

    let response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers: buildHeaders(token, options.headers),
    });

    // If 401, try to refresh the access token and retry once
    if (response.status === 401) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            try {
                const refreshRes = await fetch(getApiUrl('/auth/refresh'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newToken = data.data?.accessToken || data.accessToken;
                    if (newToken) {
                        updateAccessToken(newToken);
                        // Retry original request with new token
                        response = await fetch(getApiUrl(endpoint), {
                            ...options,
                            headers: buildHeaders(newToken, options.headers),
                        });
                    }
                } else {
                    // Refresh failed — clear tokens so user gets redirected to login
                    clearTokens();
                }
            } catch {
                clearTokens();
            }
        }
    }

    return response;
};
