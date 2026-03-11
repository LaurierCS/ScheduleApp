import { Request, Response } from 'express';
import { parseCsvFile } from '../../utils/csvUtils';
import { candidateRowSchema, type CandidateRowInput } from '../../validators/csvValidators';
import Candidate from '../../models/candidate';
import { UserRole } from '../../models/user';
import { ApiResponseUtil } from '../../utils/apiResponse';
import CodeGenerator from '../../utils/codeGenerator';

/**
 * Import candidates from CSV file
 * Creates new candidates or updates existing ones (by email)
 * Validates required fields (name, email) and optional fields (status, year, program, groupIds)
 * Returns count of imported/updated records and detailed error list
 */
export async function importCandidates(req: Request, res: Response): Promise<void> {
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
            const validationResult = candidateRowSchema.safeParse(row);
            if (!validationResult.success) {
                const fieldErrors = validationResult.error.issues
                    .map((e: any) => `${e.path.join('.')}: ${e.message}`)
                    .join('; ');
                errors.push({ rowIndex: i + 1, message: fieldErrors });
                continue;
            }

            const data = validationResult.data as CandidateRowInput;

            try {
                // Check if candidate with this email already exists
                const existingCandidate = await Candidate.findOne({ email: data.email });

                if (existingCandidate) {
                    // Update existing candidate
                    existingCandidate.name = data.name;
                    existingCandidate.status = data.status;
                    if (data.year !== undefined) {
                        existingCandidate.year = data.year;
                    }
                    if (data.program) {
                        existingCandidate.program = data.program;
                    }

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
                        existingCandidate.groupIds = validGroupIds.map(
                            (id) => new (require('mongoose')).Types.ObjectId(id)
                        );
                    }

                    await existingCandidate.save();
                    updatedCount++;
                } else {
                    // Create new candidate
                    const newCandidate = new Candidate({
                        name: data.name,
                        email: data.email,
                        password: CodeGenerator.generate6DigitCode() + CodeGenerator.generate6DigitCode(), // Generate random password
                        role: UserRole.CANDIDATE,
                        status: data.status,
                        year: data.year,
                        program: data.program,
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
                        newCandidate.groupIds = validGroupIds.map(
                            (id) => new (require('mongoose')).Types.ObjectId(id)
                        );
                    }

                    await newCandidate.save();
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
            message: 'Candidates imported successfully',
            imported: importedCount,
            updated: updatedCount,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'CSV parsing failed';
        ApiResponseUtil.error(res, message, 400);
    }
}
