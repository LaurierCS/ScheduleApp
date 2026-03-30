/**
 * Team API Service
 * Handles team-related API calls during onboarding
 */

import { authenticatedFetch } from '../utils/authClient';
import type { CreateTeamRequest, TeamResponse } from '../types/teamTypes';

const parseTeamError = async (response: Response): Promise<Error> => {
    try {
        const body = await response.json();
        const message =
            body?.error?.message ||
            body?.message ||
            body?.error ||
            'Failed to create team';
        return new Error(message);
    } catch {
        return new Error('Failed to create team');
    }
};

export const createTeam = async (data: CreateTeamRequest) => {
    const response = await authenticatedFetch('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw await parseTeamError(response);
    }

    const result: TeamResponse = await response.json();
    return result.data;
};
