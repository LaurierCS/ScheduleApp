/**
 * Team Types
 * Shared interfaces for team-related API responses
 */

export interface Team {
    _id: string;
    name: string;
    description?: string;
    adminId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTeamRequest {
    name: string;
    description?: string;
}

export interface TeamResponse {
    success: true;
    message: string;
    data: Team;
}
