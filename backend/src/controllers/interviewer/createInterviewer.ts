import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import User from '../../models/user';
import { ServerError, ValidationError } from '../../errors';
import Interviewer, { InterviewerStatus } from '../../models/interviewer';
import { createInterviewerSchema } from '../../validators/interviewerValidators';

/**
 * @route   POST /api/interviewers
 * @desc    Create a new interviewer
 * @access  Private (Admin)
 * @permissions Only admins can create interviewers
 */
export async function createInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId;
        if (!userTeamId) {
            return ApiResponseUtil.error(res, 'No team assigned', 400);
        }

        const result = createInterviewerSchema.safeParse(req.body);
        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }

        const body = result.data;

        // Check if email already exists
        const existingUser = await User.findOne({ email: body.email.toLowerCase() });
        if (existingUser) {
            return ApiResponseUtil.error(res, 'Email already exists', 400);
        }

        const interviewer = await Interviewer.create({
            name: body.name,
            email: body.email,
            password: body.password,
            groupIds: body.groupIds,
            skills: body.skills,
            capacity: body.capacity,
            status: InterviewerStatus.PENDING,
            teamId: userTeamId,
            role: UserRole.INTERVIEWER,
        });

        const { password, ...interviewerObj } = interviewer.toObject();
        return ApiResponseUtil.success(res, interviewerObj, 'Interviewer created successfully', 201);
    } catch (err: any) {
        // Handle duplicate key error
        if (err.code === 11000) {
            return ApiResponseUtil.error(res, 'Email already exists', 400);
        }
        return next(new ServerError());
    }
}
