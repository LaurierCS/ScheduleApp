import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import Candidate from '../../models/candidate';
import User, { UserRole } from '../../models/user';
import { objectIdSchema, addCandidatesBatchSchema, objectIdArrayPlain } from '../../validators/teamValidators';
import EmailService from '../../email/email';

/**
 * Add multiple candidates to team via email invitations (batch operation)
 * @route POST /api/teams/:id/candidates/batch
 * @access Private (Team Admin only)
 */
export const addTeamCandidatesBatch = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { emails, message } = addCandidatesBatchSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Verify admin access to team
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Find existing users by email
    const existingUsers = await User.find({ email: { $in: emails } }).select('email teamId role');
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

    // Update existing users to join the team as candidates
    const existingUsersToUpdate = existingUsers.filter(user => !user.teamId);
    if (existingUsersToUpdate.length > 0) {
        await User.updateMany(
            { _id: { $in: existingUsersToUpdate.map(u => u._id) } },
            { $set: { teamId: id, role: UserRole.CANDIDATE } }
        );
    }

    // Send invitation emails for new candidates
    if (emailsToInvite.length > 0) {
        try {
            const emailService = await EmailService.create();
            const inviterName = req.user.name || req.user.email;

            // Send invitations concurrently
            await Promise.all(
                emailsToInvite.map(email =>
                    emailService.sendTeamInvitation(
                        email,
                        team.name,
                        inviterName,
                        UserRole.CANDIDATE,
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
        addedCandidates: existingUsersToUpdate.length,
        invitationsSent: emailsToInvite.length,
        invitedEmails: emailsToInvite,
    };

    return ApiResponseUtil.success(
        res,
        result,
        `Batch operation completed: ${existingUsersToUpdate.length} candidates added, ${emailsToInvite.length} invitations sent`
    );
};

/**
 * Get all candidates for a team
 * @route GET /api/teams/:id/candidates
 * @access Private (Team Members)
 */
export const getTeamCandidates = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    // Verify user has access to this team
    PermissionChecker.requireTeamAccess(req, id.toString());

    // Get all candidates for this team
    const candidates = await Candidate.find({
        teamId: id,
        role: UserRole.CANDIDATE
    }).select('-password');

    return ApiResponseUtil.success(res, candidates, 'Team candidates retrieved successfully');
};

/**
 * Remove multiple candidates from team
 * @route DELETE /api/teams/:id/candidates
 * @access Private (Team Admin only)
 */
export const removeTeamCandidates = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { members: candidateIds } = { members: objectIdArrayPlain.min(1).parse(req.body.candidates || req.body.members) };

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Verify admin access to team
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Verify all candidates exist and belong to this team
    const candidates = await Candidate.find({
        _id: { $in: candidateIds },
        teamId: id,
        role: UserRole.CANDIDATE
    });

    if (candidates.length !== candidateIds.length) {
        return ApiResponseUtil.error(res, 'One or more candidates not found in this team', 404);
    }

    // Remove candidates from team (set teamId to null)
    await Candidate.updateMany(
        { _id: { $in: candidateIds } },
        { $unset: { teamId: "" } }
    );

    return ApiResponseUtil.success(res, null, `${candidateIds.length} candidates removed from team successfully`);
};