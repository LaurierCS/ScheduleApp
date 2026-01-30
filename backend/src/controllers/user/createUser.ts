import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';

/**
 * Create a new user (by admin)
 * @route POST /api/users
 * @access Private (Admin)
 */
export const createUser = (req: AuthRequest, res: Response) => {
    // TODO: Implement user creation
    // - Validate request body (name, email, password, role)
    // - Hash password
    // - Create user with admin's teamId
    // - Return created user (without password)
    ApiResponseUtil.success(res, null, 'Create user route - will be implemented in issue #94');
};
