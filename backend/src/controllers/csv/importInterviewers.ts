import { Request, Response } from 'express';
import { parseCsvFile } from '../../utils/csvUtils';
import { interviewerRowSchema, type InterviewerRowInput } from '../../validators/csvValidators';
import Interviewer from '../../models/interviewer';
import { UserRole } from '../../models/user';
import { ApiResponseUtil } from '../../utils/apiResponse';
import CodeGenerator from '../../utils/codeGenerator';

/**
 * Import interviewers from CSV file
 * Creates new interviewers or updates existing ones (by email)
 * Validates required fields (name, email) and optional fields (status, capacity, skills, groupIds)
 * Returns count of imported/updated records and detailed error list
 */
export async function importInterviewers(req: Request, res: Response): Promise<void> {
    if (!req.file) {
        ApiResponseUtil.error(res, 'No CSV file provided', 400);
        return;
    }

    try {
        const rows = await parseCsvFile(req.file);

        if (rows.length === 0) {
            ApiResponseUtil.error(res, 'CSV file is empty', 400);
            return;
        }

        const errors: Array<{ rowIndex: number; message: string }> = [];
        let importedCount = 0;
        let updatedCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Validate row against schema
            const validationResult = interviewerRowSchema.safeParse(row);
            if (!validationResult.success) {
                const fieldErrors = validationResult.error.issues
                    .map((e: any) => `${e.path.join('.')}: ${e.message}`)
                    .join('; ');
                errors.push({ rowIndex: i + 1, message: fieldErrors });
                continue;
            }

            const data = validationResult.data as InterviewerRowInput;

            try {
                // Check if interviewer with this email already exists
                const existingInterviewer = await Interviewer.findOne({ email: data.email });

                if (existingInterviewer) {
                    // Update existing interviewer
                    existingInterviewer.name = data.name;
                    existingInterviewer.status = data.status;
                    existingInterviewer.capacity = {
                        maxPerDay: data.capacityMaxPerDay,
                        maxPerWeek: data.capacityMaxPerWeek,
                    };
                    existingInterviewer.skills = data.skills;

                    // Update groupIds if provided
                    if (data.groupIds.length > 0) {
                        // Validate groupIds are valid ObjectIds
                        const validGroupIds = data.groupIds.filter((id) => {
                            try {
                                return require('mongoose').Types.ObjectId.isValid(id);
                            } catch {
                                return false;
                            }
                        });
                        existingInterviewer.groupIds = validGroupIds.map(
                            (id) => new (require('mongoose')).Types.ObjectId(id)
                        );
                    }

                    await existingInterviewer.save();
                    updatedCount++;
                } else {
                    // Create new interviewer
                    const newInterviewer = new Interviewer({
                        name: data.name,
                        email: data.email,
                        password: CodeGenerator.generate6DigitCode() + CodeGenerator.generate6DigitCode(), // Generate random password
                        role: UserRole.INTERVIEWER,
                        status: data.status,
                        capacity: {
                            maxPerDay: data.capacityMaxPerDay,
                            maxPerWeek: data.capacityMaxPerWeek,
                        },
                        skills: data.skills,
                        isActive: true,
                    });

                    // Add groupIds if provided
                    if (data.groupIds.length > 0) {
                        const validGroupIds = data.groupIds.filter((id) => {
                            try {
                                return require('mongoose').Types.ObjectId.isValid(id);
                            } catch {
                                return false;
                            }
                        });
                        newInterviewer.groupIds = validGroupIds.map(
                            (id) => new (require('mongoose')).Types.ObjectId(id)
                        );
                    }

                    await newInterviewer.save();
                    importedCount++;
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                errors.push({ rowIndex: i + 1, message });
            }
        }

        if (errors.length > 0) {
            ApiResponseUtil.error(res, 'Some rows failed validation', 400, errors);
            return;
        }

        ApiResponseUtil.success(res, {
            message: 'Interviewers imported successfully',
            imported: importedCount,
            updated: updatedCount,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'CSV parsing failed';
        ApiResponseUtil.error(res, message, 400);
    }
}
