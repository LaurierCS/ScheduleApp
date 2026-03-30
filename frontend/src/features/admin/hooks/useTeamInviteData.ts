import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { getCurrentUser } from "@/features/auth/services/authApi";
import { UserRole } from "@/features/auth/types/authTypes";
import {
    fetchTeamCandidates,
    fetchTeamInterviewers,
    fetchTeamSettingsSummary,
    removeCandidate,
    removeInterviewer,
} from "../services/teamInviteService";
import type { TeamCandidate, TeamInterviewer, TeamSettingsSummary } from "../types/inviteTypes";

export const useTeamInviteData = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const [teamId, setTeamId] = useState<string | null>(user?.teamId ?? null);
    const [settings, setSettings] = useState<TeamSettingsSummary>({ roles: [], departments: [] });
    const [candidates, setCandidates] = useState<TeamCandidate[]>([]);
    const [interviewers, setInterviewers] = useState<TeamInterviewer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = useMemo(() => user?.role === UserRole.ADMIN, [user?.role]);

    const resolveTeam = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return null;
        }

        if (user.teamId) {
            setTeamId(user.teamId);
            return user.teamId;
        }

        try {
            const fresh = await getCurrentUser();
            auth?.setUser(fresh);
            setTeamId(fresh.teamId || null);
            return fresh.teamId || null;
        } catch {
            setTeamId(null);
            return null;
        }
    }, [auth, user]);

    const loadTeamData = useCallback(
        async (resolvedTeamId?: string | null) => {
            const activeTeamId = resolvedTeamId ?? teamId;
            if (!activeTeamId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const [settingsData, candidateData, interviewerData] = await Promise.all([
                    fetchTeamSettingsSummary(activeTeamId),
                    fetchTeamCandidates(activeTeamId),
                    fetchTeamInterviewers(activeTeamId),
                ]);

                setSettings(settingsData);
                setCandidates(candidateData);
                setInterviewers(interviewerData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load team data");
            } finally {
                setIsLoading(false);
            }
        },
        [teamId]
    );

    useEffect(() => {
        if (auth?.isLoading) return;

        resolveTeam().then((resolvedTeamId) => {
            void loadTeamData(resolvedTeamId);
        });
    }, [auth?.isLoading, resolveTeam, loadTeamData]);

    const refresh = useCallback(async () => {
        await loadTeamData();
    }, [loadTeamData]);

    const handleRemoveCandidate = useCallback(
        async (candidateId: string) => {
            await removeCandidate(candidateId);
            setCandidates((prev) => prev.filter((item) => item.id !== candidateId));
        },
        []
    );

    const handleRemoveInterviewer = useCallback(
        async (interviewerId: string) => {
            await removeInterviewer(interviewerId);
            setInterviewers((prev) => prev.filter((item) => item.id !== interviewerId));
        },
        []
    );

    return {
        teamId,
        isAdmin,
        settings,
        candidates,
        interviewers,
        isLoading,
        error,
        refresh,
        removeCandidate: handleRemoveCandidate,
        removeInterviewer: handleRemoveInterviewer,
    };
};
