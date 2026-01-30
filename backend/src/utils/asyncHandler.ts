import { Response, NextFunction, Request } from 'express';

/**
 * Async handler wrapper for Express routes
 * Catches errors and forwards to error middleware
 */
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown) =>
        (req: Request, res: Response, next: NextFunction) =>
            Promise.resolve(fn(req, res, next)).catch(next);
