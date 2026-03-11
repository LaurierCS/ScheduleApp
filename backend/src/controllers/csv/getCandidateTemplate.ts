import { Request, Response } from 'express';
import { makeCsvTemplate } from '../../utils/csvUtils';

/**
 * Get candidate CSV import template
 * Returns a CSV file with headers and an example row
 * Useful for users to understand the required/optional fields
 */
export function getCandidateTemplate(_req: Request, res: Response): void {
    try {
        const headers = ['name', 'email', 'status', 'year', 'program', 'groupIds'];

        const exampleRow = {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'active',
            year: '2',
            program: 'Computer Science',
            groupIds: '',
        };

        const csv = makeCsvTemplate(headers, exampleRow);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="candidate-template.csv"');
        res.send(csv);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Template generation failed';
        res.status(500).json({ message });
    }
}
