import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Schema } from 'mongoose';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import { ValidationError } from '../../errors';
import Candidate from '../../models/candidate';
import { updateCandidateSchema } from '../../validators/candidateValidators';

/**
 * @route   PUT /api/candidates/:id
 * @desc    Update candidate by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team candidates, candidates can update their own profile
 */
export async function updateCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Check if user can modify this candidate
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            candidateTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile', 403);
        }

        // Validate request body
        const result = updateCandidateSchema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }
        else {
            const { name, email, groupIds, resumeUrl, year, program } = result.data;

            // Parse optional update parameters
            if (name !== undefined) candidate.name = name;
            if (email !== undefined) candidate.email = email;
            if (groupIds !== undefined) candidate.groupIds = groupIds.map(id => new Schema.Types.ObjectId(id));
            if (resumeUrl !== undefined) candidate.resumeUrl = resumeUrl;
            if (year !== undefined) candidate.year = year;
            if (program !== undefined) candidate.program = program;

            await candidate.save();

            // Remove password property from the response
            const { password, ...candidateObj } = candidate.toObject();

            // - Return updated candidate (without password)
            ApiResponseUtil.success(res, candidateObj, `Update candidate ${req.params.id}`);
        }
    } catch (error) {
        next(error);
    }
}
