import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import Team from '../../models/team';
import User, { UserRole } from '../../models/user';
import { createTeamSchema } from '../../validators/teamValidators';

/**
 * Create a new team
 * @route POST /api/teams
 * @access Private (Authenticated users - creator becomes admin)
 */
export const createTeam = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const data = createTeamSchema.parse(req.body);
    const userId = (req.user as any)._id;

    // Create team with current user as admin
    const team = await Team.create({
        name: data.name,
        description: data.description,
        adminId: userId,
        isActive: true,
    });

    // Update user's teamId and role to admin
    await User.findByIdAndUpdate(userId, {
        teamId: team._id,
        role: UserRole.ADMIN,
    });

    return ApiResponseUtil.success(res, team, 'Team created successfully', 201);
};
