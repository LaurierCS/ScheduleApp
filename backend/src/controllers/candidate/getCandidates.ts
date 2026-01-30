import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { isValidObjectId, Schema } from 'mongoose';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { ValidationError } from '../../errors';
import Candidate, { CandidateStatus } from '../../models/candidate';

/**
 * @route   GET /api/candidates
 * @desc    Get all candidates in team (with pagination)
 * @access  Private (Admin and Interviewers)
 * @permissions Admins and interviewers can view all candidates in their team
 */
export async function getCandidates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const { name, email, status, groupIds } = req.query;

        const filter: any = {};

        if (name) filter.name = name;

        if (email) {
            // Prevent invalid email formats
            if (!(typeof email == "string" && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)))
                return next(new ValidationError(undefined, "Please enter a valid email"));

            filter.email = email;
        }
        if (status) {
            // Invalid status provided
            if (!(typeof status === "string" && Object.values(CandidateStatus).includes(status as CandidateStatus)))
                return next(new ValidationError(undefined, "Please enter a valid Candidate status"));

            filter.status = status;
        };
        if (groupIds) {
            if (!Array.isArray(groupIds))
                return next(new ValidationError(undefined, "groupIds must be an array"));

            const isValidIds = groupIds.every(id => typeof id === "string" && isValidObjectId(id));

            if (!isValidIds)
                return next(new ValidationError(undefined, "groupIds must be an array of valid Group objectIds"));

            filter.groupIds = { $in: groupIds };
        };

        // Can only GET candidates in the same team
        filter.teamId = userTeamId;

        const candidates = await Candidate.find(filter)
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, candidates, 'Candidates retrieved successfully');
    } catch (error) {
        next(error);
    }
}
