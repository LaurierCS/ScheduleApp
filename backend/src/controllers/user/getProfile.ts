import { Request, Response, NextFunction } from 'express';
import { me as authMe } from '../auth/profile';

// simply reuse the auth controller so we have a user-specific endpoint
export const getProfile = (req: Request, res: Response, next: NextFunction) => {
    // authMe already handles the logic and expects req.user to be set
    return authMe(req, res, next);
};
