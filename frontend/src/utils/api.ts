// api configuration utilities

// get backend url from environment variables or use default
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8123';
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';

// build complete api url
export const getApiUrl = (endpoint: string): string => {
  // if endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // if endpoint already includes api prefix, don't add it again
  if (endpoint.startsWith(API_PREFIX)) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // add api prefix to endpoint
  return `${API_BASE_URL}${API_PREFIX}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// base fetch function that uses the api url
export const apiFetch = (endpoint: string, options?: RequestInit): Promise<Response> => {
  return fetch(getApiUrl(endpoint), options);
}; 