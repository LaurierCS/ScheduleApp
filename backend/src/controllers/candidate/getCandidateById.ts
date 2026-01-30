import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import User from '../../models/user';

/**
 * @route   GET /api/candidates/:id
 * @desc    Get candidate by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates, candidates can view their own profile
 */
export async function getCandidateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id).select('-password');

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // Ensure target user is a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Check if user can view this candidate
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            candidateTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view candidates in your team', 403);
        }

        ApiResponseUtil.success(res, candidate, 'Candidate retrieved successfully');
    } catch (error) {
        next(error);
    }
}
