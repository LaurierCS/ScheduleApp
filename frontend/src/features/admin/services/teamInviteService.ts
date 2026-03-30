import { authenticatedFetch } from "@/features/auth/utils/authClient";
import type { InviteBatchResult, TeamCandidate, TeamInterviewer, TeamSettingsSummary } from "../types/inviteTypes";

type CandidateResponse = {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    status?: string;
    program?: string;
    year?: number;
};

type InterviewerResponse = {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    status?: string;
    skills?: string[];
};

const parseError = async (response: Response, fallback: string) => {
    try {
        const body = await response.json();
        const message =
            body?.error?.message ||
            body?.message ||
            body?.error ||
            fallback;
        return new Error(message);
    } catch {
        return new Error(fallback);
    }
};

const extractData = async <T>(response: Response, fallback: string): Promise<T> => {
    if (!response.ok) {
        throw await parseError(response, fallback);
    }

    const data = await response.json();
    return (data?.data ?? data) as T;
};

export const fetchTeamSettingsSummary = async (teamId: string): Promise<TeamSettingsSummary> => {
    const response = await authenticatedFetch(`/teams/${teamId}/settings`);
    const data = await extractData<{ roles?: string[]; departments?: string[] }>(
        response,
        "Failed to load team settings"
    );

    return {
        roles: data?.roles || [],
        departments: data?.departments || [],
    };
};

export const fetchTeamCandidates = async (teamId: string): Promise<TeamCandidate[]> => {
    const response = await authenticatedFetch(`/teams/${teamId}/candidates`);
    const data = await extractData<CandidateResponse[]>(response, "Failed to load candidates");

    return (data || [])
        .map((candidate) => {
            const id = candidate._id ?? candidate.id;
            if (!id) {
                return null;
            }
            const item: TeamCandidate = {
                id,
                name: candidate.name,
                email: candidate.email,
            };
            if (candidate.status !== undefined) {
                item.status = candidate.status;
            }
            if (candidate.program !== undefined) {
                item.program = candidate.program;
            }
            if (candidate.year !== undefined) {
                item.year = candidate.year;
            }
            return item;
        })
        .filter((candidate): candidate is TeamCandidate => candidate !== null);
};

export const fetchTeamInterviewers = async (teamId: string): Promise<TeamInterviewer[]> => {
    const response = await authenticatedFetch(`/teams/${teamId}/interviewers`);
    const data = await extractData<InterviewerResponse[]>(response, "Failed to load interviewers");

    return (data || [])
        .map((interviewer) => {
            const id = interviewer._id ?? interviewer.id;
            if (!id) {
                return null;
            }
            const item: TeamInterviewer = {
                id,
                name: interviewer.name,
                email: interviewer.email,
            };
            if (interviewer.status !== undefined) {
                item.status = interviewer.status;
            }
            if (interviewer.skills !== undefined) {
                item.skills = interviewer.skills;
            }
            return item;
        })
        .filter((interviewer): interviewer is TeamInterviewer => interviewer !== null);
};

export const sendCandidateInvites = async (
    teamId: string,
    emails: string[],
    message?: string
): Promise<InviteBatchResult> => {
    const response = await authenticatedFetch(`/teams/${teamId}/candidates/batch`, {
        method: "POST",
        body: JSON.stringify({ emails, message }),
    });

    return extractData<InviteBatchResult>(response, "Failed to send candidate invites");
};

export const sendInterviewerInvites = async (
    teamId: string,
    emails: string[],
    message?: string
): Promise<InviteBatchResult> => {
    const response = await authenticatedFetch(`/teams/${teamId}/members/batch`, {
        method: "POST",
        body: JSON.stringify({ emails, role: "interviewer", message }),
    });

    return extractData<InviteBatchResult>(response, "Failed to send interviewer invites");
};

export const removeCandidate = async (candidateId: string): Promise<void> => {
    const response = await authenticatedFetch(`/candidates/${candidateId}`, {
        method: "DELETE",
    });

    await extractData(response, "Failed to remove candidate");
};

export const removeInterviewer = async (interviewerId: string): Promise<void> => {
    const response = await authenticatedFetch(`/interviewers/${interviewerId}`, {
        method: "DELETE",
    });

    await extractData(response, "Failed to remove interviewer");
};
