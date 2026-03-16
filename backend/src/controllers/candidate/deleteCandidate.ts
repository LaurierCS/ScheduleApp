import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import User from '../../models/user';
import Candidate from '../../models/candidate';
import Meeting from '../../models/meeting';
import Availability from '../../models/availability';

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Delete candidate by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete candidates in their team
 */
export async function deleteCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Ensure candidate is in the same team
        if (currentUserTeamId !== candidateTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete candidates in your team', 403);
        }

        // Block deletion if candidate has scheduled meetings
        const meetings = await Meeting.find({ candidateId: candidate._id });
        if (meetings.length > 0) {
            return ApiResponseUtil.error(res, 'Cannot remove candidate with scheduled meetings', 409);
        }

        // Cascade delete availability records, then delete candidate
        await Availability.deleteMany({ userId: candidate._id });
        await Candidate.findByIdAndDelete(candidate._id);

        // - Return success response
        ApiResponseUtil.success(res, null, `Candidate ${req.params.id} deleted successfully.`);
    } catch (error) {
        next(error);
    }
}
