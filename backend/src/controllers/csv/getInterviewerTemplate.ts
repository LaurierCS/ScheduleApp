import { Request, Response } from 'express';
import { makeCsvTemplate } from '../../utils/csvUtils';

/**
 * Get interviewer CSV import template
 * Returns a CSV file with headers and an example row
 * Useful for users to understand the required/optional fields
 */
export function getInterviewerTemplate(_req: Request, res: Response): void {
    try {
        const headers = [
            'name',
            'email',
            'status',
            'capacityMaxPerDay',
            'capacityMaxPerWeek',
            'skills',
            'groupIds',
        ];

        const exampleRow = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'active',
            capacityMaxPerDay: '5',
            capacityMaxPerWeek: '20',
            skills: 'React,TypeScript,Testing',
            groupIds: '',
        };

        const csv = makeCsvTemplate(headers, exampleRow);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="interviewer-template.csv"');
        res.send(csv);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Template generation failed';
        res.status(500).json({ message });
    }
}
