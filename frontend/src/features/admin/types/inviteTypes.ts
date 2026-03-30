export type InviteRole = "candidate" | "interviewer";

export type InviteSource = "manual" | "csv";

export type InviteStatus = "sent" | "failed";

export interface RecentInvite {
    id: string;
    email: string;
    role: InviteRole;
    source: InviteSource;
    status: InviteStatus;
    createdAt: string;
    message?: string;
}

export interface TeamSettingsSummary {
    roles: string[];
    departments: string[];
}

export interface TeamCandidate {
    id: string;
    name: string;
    email: string;
    status?: string;
    program?: string;
    year?: number;
}

export interface TeamInterviewer {
    id: string;
    name: string;
    email: string;
    status?: string;
    skills?: string[];
}

export interface InviteBatchResult {
    addedUsers?: number;
    addedCandidates?: number;
    invitationsSent: number;
    invitedEmails: string[];
}

export interface InviteSendPayload {
    teamId: string;
    role: InviteRole;
    emails: string[];
    message?: string;
    source?: InviteSource;
}

export interface InviteCsvSummary {
    fileName: string;
    rowCount: number;
    emailCount: number;
    invalidCount: number;
    hasHeader: boolean;
}
