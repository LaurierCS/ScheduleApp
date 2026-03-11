import { Request, Response } from 'express';
import Candidate from '../../models/candidate';
import { generateCsv } from '../../utils/csvUtils';

/**
 * Export candidates to CSV format
 * Exports all candidates with relevant fields
 * Sets appropriate response headers for CSV download
 */
export async function exportCandidates(_req: Request, res: Response): Promise<void> {
    try {
        const candidates = await Candidate.find({}).lean();

        const csvHeaders = ['email', 'name', 'status', 'year', 'program', 'groupIds', 'createdAt', 'updatedAt'];

        const csvData = candidates.map((candidate) => ({
            email: candidate.email,
            name: candidate.name,
            status: candidate.status,
            year: candidate.year ?? '',
            program: candidate.program ?? '',
            groupIds: (candidate.groupIds ?? []).join(','),
            createdAt: (candidate.createdAt as Date).toISOString(),
            updatedAt: (candidate.updatedAt as Date).toISOString(),
        }));

        const csv = generateCsv(csvData, csvHeaders);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
        res.send(csv);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        res.status(500).json({ message });
    }
}
