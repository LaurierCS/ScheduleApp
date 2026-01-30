import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ServerError, ValidationError } from '../../errors';
import Candidate, { CandidateStatus } from '../../models/candidate';
import { createCandidateSchema } from '../../validators/candidateValidators';

/**
 * @route   POST /api/candidates
 * @desc    Create a new candidate
 * @access  Private (Admin)
 * @permissions Only admins can create candidates
 */
export async function createCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId;

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const result = createCandidateSchema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }
        else {
            const body = result.data;

            const candidate = await Candidate.create({
                name: body.name,
                email: body.email,
                password: body.password,
                groupIds: body.groupIds,
                status: CandidateStatus.PENDING,
                teamId: userTeamId,
                resumeUrl: body.resumeUrl,
                year: body.year,
                program: body.program
            });

            // Remove password property from the response
            const { password, ...candidateObj } = candidate.toObject();

            return ApiResponseUtil.success(res, candidateObj, 'Candidate created successfully', 201);
        }
    } catch (err) {
        return next(new ServerError());
    }
}
