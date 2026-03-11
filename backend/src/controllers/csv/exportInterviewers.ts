import { Request, Response } from 'express';
import Interviewer from '../../models/interviewer';
import { generateCsv } from '../../utils/csvUtils';

/**
 * Export interviewers to CSV format
 * Exports all interviewers with relevant fields
 * Sets appropriate response headers for CSV download
 */
export async function exportInterviewers(_req: Request, res: Response): Promise<void> {
    try {
        const interviewers = await Interviewer.find({}).lean();

        const csvHeaders = [
            'email',
            'name',
            'status',
            'capacityMaxPerDay',
            'capacityMaxPerWeek',
            'skills',
            'groupIds',
            'createdAt',
            'updatedAt',
        ];

        const csvData = interviewers.map((interviewer) => ({
            email: interviewer.email,
            name: interviewer.name,
            status: interviewer.status,
            capacityMaxPerDay: interviewer.capacity?.maxPerDay ?? 10,
            capacityMaxPerWeek: interviewer.capacity?.maxPerWeek ?? 40,
            skills: (interviewer.skills ?? []).join(','),
            groupIds: (interviewer.groupIds ?? []).join(','),
            createdAt: (interviewer.createdAt as Date).toISOString(),
            updatedAt: (interviewer.updatedAt as Date).toISOString(),
        }));

        const csv = generateCsv(csvData, csvHeaders);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="interviewers.csv"');
        res.send(csv);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        res.status(500).json({ message });
    }
}
