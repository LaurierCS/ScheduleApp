import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import User from '../../models/user';
import Availability from '../../models/availability';

/**
 * @route   GET /api/candidates/:id/availability
 * @desc    Get candidate availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates' availability, candidates can view their own
 */
export async function getCandidateAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id);

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

        // Check if user can view this candidate's availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            candidateTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of candidates in your team', 403);
        }

        // Query Availability model for candidate's availability records
        const availability = await Availability.find({ userId: candidate._id });

        // Return availability data
        ApiResponseUtil.success(
            res,
            availability,
            `Availability of candidate ${req.params.id}`
        );
    } catch (error) {
        next(error);
    }
}
