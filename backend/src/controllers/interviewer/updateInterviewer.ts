import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import User from '../../models/user';
import { ValidationError } from '../../errors';
import { updateInterviewerSchema } from '../../validators/interviewerValidators';

/**
 * @route   PUT /api/interviewers/:id
 * @desc    Update interviewer by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team interviewers, users can update their own profile
 */
export async function updateInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const interviewer = await User.findById(req.params.id);

        if (!interviewer) {
            return ApiResponseUtil.error(res, 'Interviewer not found', 404);
        }

        // Ensure target user is an interviewer
        if (interviewer.role !== UserRole.INTERVIEWER) {
            return ApiResponseUtil.error(res, 'User is not an interviewer', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const interviewerTeamId = interviewer.teamId?.toString();

        // Check if user can modify this interviewer
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            interviewerTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile or team members as admin', 403);
        }

        const result = updateInterviewerSchema.safeParse(req.body);
        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }

        const { name, email, groupIds, skills, status, capacity } = result.data;

        if (name !== undefined) interviewer.name = name;
        if (email !== undefined) interviewer.email = email;
        if (groupIds !== undefined) (interviewer as any).groupIds = groupIds;
        if (skills !== undefined) (interviewer as any).skills = skills;
        if (status !== undefined) (interviewer as any).status = status;
        if (capacity !== undefined) {
            if (capacity.maxPerDay !== undefined) (interviewer as any).capacity.maxPerDay = capacity.maxPerDay;
            if (capacity.maxPerWeek !== undefined) (interviewer as any).capacity.maxPerWeek = capacity.maxPerWeek;
        }

        await interviewer.save();

        const { password, ...interviewerObj } = interviewer.toObject();
        ApiResponseUtil.success(res, interviewerObj, 'Interviewer updated successfully');
    } catch (error) {
        next(error);
    }
}
