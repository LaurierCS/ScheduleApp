import { useCallback, useState } from "react";
import type { InviteBatchResult, InviteRole, InviteSendPayload, RecentInvite } from "../types/inviteTypes";
import { sendCandidateInvites, sendInterviewerInvites } from "../services/teamInviteService";

const buildInviteId = (email: string, role: InviteRole) => {
    return `${email}-${role}-${Date.now()}`;
};

export const useInviteActions = (teamId: string | null) => {
    const [recentInvites, setRecentInvites] = useState<RecentInvite[]>([]);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSending, setIsSending] = useState(false);

    const sendInvites = useCallback(
        async (payload: InviteSendPayload): Promise<InviteBatchResult> => {
            if (!payload.emails.length) {
                throw new Error("Add at least one email address.");
            }
            if (!teamId) {
                throw new Error("Team is not ready yet.");
            }

            setIsSending(true);
            setStatus(null);

            try {
                const result =
                    payload.role === "candidate"
                        ? await sendCandidateInvites(teamId, payload.emails, payload.message)
                        : await sendInterviewerInvites(teamId, payload.emails, payload.message);

                const timestamp = new Date().toISOString();
                const entries: RecentInvite[] = payload.emails.map((email) => ({
                    id: buildInviteId(email, payload.role),
                    email,
                    role: payload.role,
                    source: payload.source || "manual",
                    status: "sent",
                    createdAt: timestamp,
                    message: payload.message,
                }));

                setRecentInvites((prev) => [...entries, ...prev].slice(0, 50));
                setStatus({
                    type: "success",
                    message: `Invited ${payload.emails.length} ${payload.role === "candidate" ? "candidate" : "interviewer"}s.`,
                });

                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to send invites";
                setStatus({ type: "error", message });
                throw err;
            } finally {
                setIsSending(false);
            }
        },
        [teamId]
    );

    const resendInvite = useCallback(
        async (invite: RecentInvite) => {
            return sendInvites({
                teamId: teamId || "",
                role: invite.role,
                emails: [invite.email],
                message: invite.message,
                source: invite.source,
            });
        },
        [sendInvites, teamId]
    );

    const dismissInvite = useCallback((inviteId: string) => {
        setRecentInvites((prev) => prev.filter((item) => item.id !== inviteId));
    }, []);

    return {
        recentInvites,
        status,
        isSending,
        sendInvites,
        resendInvite,
        dismissInvite,
        clearStatus: () => setStatus(null),
    };
};
