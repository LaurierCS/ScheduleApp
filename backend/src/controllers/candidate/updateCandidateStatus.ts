import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ValidationError } from '../../errors';
import Candidate from '../../models/candidate';
import { updateCandidateStatusSchema } from '../../validators/candidateValidators';
import { UserRole } from '../../models/user';

/**
 * @route   POST /api/candidates/:id/status
 * @desc    Update the status of a candidate
 * @access  Private (Admin and Interviewers in same team)
 * @permissions Admins and interviewers may change the status of candidates in their team
 */
export async function updateCandidateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const parsed = updateCandidateStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ValidationError(undefined, parsed.error.message));
        }
        const { status } = parsed.data;

        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // ensure target is indeed a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        const allowRole =
            (currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.INTERVIEWER) &&
            currentUserTeamId &&
            candidateTeamId &&
            currentUserTeamId === candidateTeamId;

        if (!allowRole) {
            return ApiResponseUtil.error(
                res,
                'Access denied: you can only change status of candidates in your team',
                403
            );
        }

        candidate.status = status;
        await candidate.save();

        const { password, ...obj } = candidate.toObject();
        ApiResponseUtil.success(res, obj, 'Candidate status updated');
    } catch (err) {
        next(err);
    }
}
