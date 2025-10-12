import { Response } from 'express';
import { ApiResponse } from '../interfaces/apiInterfaces';

/**
 * Class for standardized API responses
 */
export class ApiResponseUtil {
    /**
     * Send success response
     */
    static success<T>(
        res: Response,
        data?: T,
        message = 'Success',
        statusCode = 200,
        meta?: ApiResponse['meta']
    ): void {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
        };

        if (meta) {
            response.meta = meta;
        }

        res.status(statusCode).json(response);
    }

    /**
     * Send error response
     */
    static error(
        res: Response,
        message = 'Error occurred',
        statusCode = 500,
        errors?: any[],
        stack?: string
    ): void {
        const response: ApiResponse = {
            success: false,
            message,
            error: message,
        };

        if (errors) {
            response.errors = errors;
        }

        // Only include stack trace in development
        if (process.env.NODE_ENV !== 'production' && stack) {
            response.stack = stack;
        }

        res.status(statusCode).json(response);
    }

    /**
     * Send paginated response
     */
    static paginated<T>(
        res: Response,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message = 'Success'
    ): void {
        const totalPages = Math.ceil(total / limit);

        this.success(res, data, message, 200, {
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    }

    /**
     * Send not found response
     */
    static notFound(res: Response, message = 'Resource not found'): void {
        this.error(res, message, 404);
    }

    /**
     * Send unauthorized response
     */
    static unauthorized(res: Response, message = 'Unauthorized'): void {
        this.error(res, message, 401);
    }

    /**
     * Send forbidden response
     */
    static forbidden(res: Response, message = 'Forbidden'): void {
        this.error(res, message, 403);
    }

    /**
     * Send bad request response
     */
    static badRequest(res: Response, message = 'Bad request', errors?: any[]): void {
        this.error(res, message, 400, errors);
    }

    /**
     * Send validation error response
     */
    static validationError(res: Response, errors: any[]): void {
        this.error(res, 'Validation error', 422, errors);
    }
}