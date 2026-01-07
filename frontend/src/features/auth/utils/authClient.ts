/**
 * Authenticated HTTP Client
 * Provides a fetch wrapper that automatically includes JWT authentication headers
 */

import { getApiUrl } from '../../../utils/api';
import { getAccessToken } from '../utils/tokenStorage';

// ============================================================================
// AUTHENTICATED FETCH
// ============================================================================

/**
 * Makes an authenticated HTTP request to the API
 * Automatically adds Authorization header with JWT token if available
 * 
 * @param endpoint - API endpoint path (e.g., '/auth/login')
 * @param options - Standard fetch options (method, body, headers, etc.)
 * @returns Promise with the Response object
 * 
 * @example
 * ```typescript
 * const response = await authenticatedFetch('/auth/me', { method: 'GET' });
 * const data = await response.json();
 * ```
 */
export const authenticatedFetch = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = getAccessToken();

    // Start with default headers and merge with any provided headers
    let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
        // Use Headers object for safe header manipulation
        const mutableHeaders = new Headers(headers);
        mutableHeaders.set('Authorization', `Bearer ${token}`);
        headers = mutableHeaders;
    }

    // Make the request with authentication headers
    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });

    return response;
};
