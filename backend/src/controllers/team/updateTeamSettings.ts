import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import TeamSettings from '../../models/teamSettings';
import { objectIdSchema, updateTeamSettingsSchema } from '../../validators/teamValidators';

/**
 * Update team settings
 * @route PUT /api/teams/:id/settings
 * @access Private (Team Admin only)
 */
export const updateTeamSettings = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const data = updateTeamSettingsSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Get or create team settings
    let settings = await TeamSettings.findOne({ teamId: id });

    if (!settings) {
        // Create settings if not exists
        settings = await TeamSettings.create({
            teamId: id,
            ...data,
        });
    } else {
        // Update existing settings by directly modifying the document

        // Update defaultAvailability
        if (data.defaultAvailability) {
            Object.keys(data.defaultAvailability).forEach((day) => {
                const dayData = (data.defaultAvailability as any)[day];
                if (dayData) {
                    const currentDay = (settings as any).defaultAvailability[day];

                    // Deep merge for each day
                    if (dayData.enabled !== undefined) {
                        currentDay.enabled = dayData.enabled;
                    }
                    if (dayData.timeSlots !== undefined) {
                        currentDay.timeSlots = dayData.timeSlots;
                    }
                }
            });
        }

        // Update emailTemplates
        if (data.emailTemplates) {
            Object.keys(data.emailTemplates).forEach((template) => {
                const templateData = (data.emailTemplates as any)[template];
                if (templateData) {
                    const currentTemplate = (settings as any).emailTemplates[template];

                    // Deep merge for each template
                    if (templateData.subject !== undefined) {
                        currentTemplate.subject = templateData.subject;
                    }
                    if (templateData.body !== undefined) {
                        currentTemplate.body = templateData.body;
                    }
                }
            });
        }

        // Update interviewDurationDefaults
        if (data.interviewDurationDefaults) {
            Object.keys(data.interviewDurationDefaults).forEach((key) => {
                const value = (data.interviewDurationDefaults as any)[key];
                if (value !== undefined) {
                    (settings as any).interviewDurationDefaults[key] = value;
                }
            });
        }

        // Update groupConfig
        if (data.groupConfig) {
            Object.keys(data.groupConfig).forEach((key) => {
                const value = (data.groupConfig as any)[key];
                if (value !== undefined) {
                    (settings as any).groupConfig[key] = value;
                }
            });
        }

        // Mark nested paths as modified to ensure Mongoose saves them
        if (data.defaultAvailability) {
            settings.markModified('defaultAvailability');
        }
        if (data.emailTemplates) {
            settings.markModified('emailTemplates');
        }
        if (data.interviewDurationDefaults) {
            settings.markModified('interviewDurationDefaults');
        }
        if (data.groupConfig) {
            settings.markModified('groupConfig');
        }

        // Save the document
        await settings.save();
    }

    return ApiResponseUtil.success(res, settings, 'Team settings updated successfully');
};
