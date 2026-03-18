import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import Team from '../../models/team';
import User, { UserRole } from '../../models/user';
import { objectIdSchema, addMembersBatchSchema } from '../../validators/teamValidators';
import EmailService from '../../email/email';

/**
 * Add multiple members to team via email invitations (batch operation)
 * @route POST /api/teams/:id/members/batch
 * @access Private (Team Admin only)
 */
export const addTeamMembersBatch = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { emails, role, message } = addMembersBatchSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN) {
        return ApiResponseUtil.error(res, 'Access denied: admin role required', 403);
    }

    // Find existing users by email
    const existingUsers = await User.find({ email: { $in: emails } }).select('email teamId');
    const existingEmails = new Set(existingUsers.map(user => user.email));

    // Check if any existing users are already in a team
    const usersWithTeam = existingUsers.filter(user => user.teamId);
    if (usersWithTeam.length > 0) {
        const conflictEmails = usersWithTeam.map(user => user.email).join(', ');
        return ApiResponseUtil.error(
            res,
            `Users already in teams: ${conflictEmails}`,
            400
        );
    }

    // Get emails that need invitations (don't exist as users yet)
    const emailsToInvite = emails.filter(email => !existingEmails.has(email));

    // Update existing users to join the team
    const existingUsersToUpdate = existingUsers.filter(user => !user.teamId);
    if (existingUsersToUpdate.length > 0) {
        const updateData: any = { teamId: id };
        if (role) updateData.role = role;

        await User.updateMany(
            { _id: { $in: existingUsersToUpdate.map(u => u._id) } },
            { $set: updateData }
        );
    }

    // Send invitation emails for new users
    if (emailsToInvite.length > 0) {
        try {
            const emailService = await EmailService.create();
            const inviterName = req.user.name || req.user.email;
            const roleDisplay = role || UserRole.INTERVIEWER;

            // Send invitations concurrently
            await Promise.all(
                emailsToInvite.map(email =>
                    emailService.sendTeamInvitation(
                        email,
                        team.name,
                        inviterName,
                        roleDisplay,
                        message
                    )
                )
            );
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the whole operation if emails fail
        }
    }

    const result = {
        addedUsers: existingUsersToUpdate.length,
        invitationsSent: emailsToInvite.length,
        invitedEmails: emailsToInvite,
    };

    return ApiResponseUtil.success(
        res,
        result,
        `Batch operation completed: ${existingUsersToUpdate.length} users added, ${emailsToInvite.length} invitations sent`
    );
};