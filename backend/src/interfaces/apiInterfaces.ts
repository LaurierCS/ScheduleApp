/**
 * Interfaces for API requests and responses
 */

// API response structure
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: any[];
    stack?: string;
    meta?: {
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        [key: string]: any;
    };
}

// Pagination parameters
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// Error response interface
export interface ErrorResponse {
    status: number;
    message: string;
    errors?: any[];
    stack?: string;
}