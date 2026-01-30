import { Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { ValidationError } from '../../errors';
import Interviewer, { InterviewerStatus } from '../../models/interviewer';

/**
 * @route   GET /api/interviewers
 * @desc    Get all interviewers in team (with filtering)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all interviewers in their team
 */
export async function getInterviewers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const { name, email, status, groupIds, skills } = req.query;

        const filter: any = {
            teamId: userTeamId,
            role: UserRole.INTERVIEWER,
        };

        // Name filter - partial match, case-insensitive
        if (name && typeof name === 'string') {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Email filter - exact match (lowercase)
        if (email && typeof email === 'string') {
            filter.email = email.toLowerCase();
        }

        // Status filter
        if (status && typeof status === 'string') {
            if (!Object.values(InterviewerStatus).includes(status as InterviewerStatus)) {
                return next(new ValidationError(undefined, 'Please enter a valid interviewer status'));
            }
            filter.status = status;
        }

        // GroupIds filter - match any
        if (groupIds) {
            const groupIdArray = Array.isArray(groupIds) ? groupIds : [groupIds];
            const isValidIds = groupIdArray.every(id => typeof id === 'string' && isValidObjectId(id));
            if (!isValidIds) {
                return next(new ValidationError(undefined, 'groupIds must be valid ObjectIds'));
            }
            filter.groupIds = { $in: groupIdArray };
        }

        // Skills filter - match any, case-insensitive
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            const skillRegexes = skillsArray.map(s => new RegExp(`^${s}$`, 'i'));
            filter.skills = { $in: skillRegexes };
        }

        const interviewers = await Interviewer.find(filter)
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, interviewers, 'Interviewers retrieved successfully');
    } catch (error) {
        next(error);
    }
}
