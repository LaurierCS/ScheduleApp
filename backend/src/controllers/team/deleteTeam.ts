import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User, { UserRole } from '../../models/user';
import Group from '../../models/group';
import TeamSettings from '../../models/teamSettings';
import Meeting, { MeetingStatus } from '../../models/meeting';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Delete team by ID
 * @route DELETE /api/teams/:id
 * @access Private (Team Admin only)
 */
export const deleteTeam = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Check for active meetings (scheduled, confirmed, or rescheduled)
    const activeMeetings = await Meeting.countDocuments({
        teamId: id,
        status: {
            $in: [MeetingStatus.SCHEDULED, MeetingStatus.CONFIRMED, MeetingStatus.RESCHEDULED],
        },
    });

    if (activeMeetings > 0) {
        return ApiResponseUtil.error(
            res,
            `Cannot delete team: ${activeMeetings} active meeting(s) scheduled. Please cancel or complete all meetings before deleting the team.`,
            400
        );
    }

    // Check for active members (excluding admin)
    const activeMembersCount = await User.countDocuments({
        teamId: id,
        _id: { $ne: teamAdminId },
    });

    if (activeMembersCount > 0) {
        return ApiResponseUtil.error(
            res,
            `Cannot delete team: ${activeMembersCount} active member(s) in the team. Please remove all members before deleting the team.`,
            400
        );
    }

    // Remove team reference from all users
    await User.updateMany({ teamId: id }, { $unset: { teamId: '' }, role: UserRole.CANDIDATE });

    // Delete all groups associated with this team
    await Group.deleteMany({ teamId: id });

    // Delete team settings if exists
    await TeamSettings.deleteOne({ teamId: id });

    // Delete the team
    await Team.findByIdAndDelete(id);

    return ApiResponseUtil.success(res, null, 'Team deleted successfully');
};
