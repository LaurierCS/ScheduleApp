import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import Team from '../../models/team';
import { UserRole } from '../../models/user';

/**
 * Get user's own team or all teams (admin only)
 * @route GET /api/teams
 * @access Private (All authenticated users)
 */
export const getTeams = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const userRole = req.user.role || UserRole.CANDIDATE;
    const userTeamId = req.user.teamId?.toString();

    // Admins can view all teams with pagination
    if (userRole === UserRole.ADMIN && req.query.all === '1') {
        const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Team.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('adminId', 'name email'),
            Team.countDocuments(),
        ]);

        return ApiResponseUtil.success(
            res,
            { items, page, limit, total },
            'Teams retrieved successfully'
        );
    }

    // Regular users can only view their own team
    if (!userTeamId) {
        return ApiResponseUtil.success(res, [], 'No team assigned');
    }

    const team = await Team.findById(userTeamId).populate('adminId', 'name email');
    return ApiResponseUtil.success(res, team ? [team] : [], 'Team retrieved successfully');
};
