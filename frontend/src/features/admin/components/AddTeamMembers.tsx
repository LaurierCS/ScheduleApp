import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import AddInterviewers from "./AddInterviewers";
import AddInterviewees from "./AddInterviewees";
import InviteFormPanel from "./InviteFormPanel";
import InviteHeader from "./InviteHeader";
import InviteSidebar from "./InviteSidebar";
import { useInviteActions, useTeamInviteData } from "@/features/admin/hooks";
import { dedupeEmails, parseEmailList, parseInviteCsv } from "../utils";
import type { InviteCsvSummary, InviteRole } from "../types";

export default function AddTeamMembers() {
	const {
		teamId,
		isAdmin,
		settings,
		candidates,
		interviewers,
		isLoading,
		error,
		refresh,
		removeCandidate,
		removeInterviewer,
	} = useTeamInviteData();
	const {
		recentInvites,
		status,
		isSending,
		sendInvites,
		resendInvite,
		dismissInvite,
		clearStatus,
	} = useInviteActions(teamId);

	const [inviteRole, setInviteRole] = useState<InviteRole>("candidate");
	const [emailInput, setEmailInput] = useState("");
	const [message, setMessage] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [csvMeta, setCsvMeta] = useState<InviteCsvSummary | null>(null);

	const parsedEmails = useMemo(() => parseEmailList(emailInput), [emailInput]);
	const canSend =
		!!teamId &&
		isAdmin &&
		parsedEmails.emails.length > 0 &&
		parsedEmails.invalid.length === 0 &&
		!isSending;

	const handleCsvUpload = async (file: File | null) => {
		if (!file) return;
		const content = await file.text();
		const parsed = parseInviteCsv(content);
		const merged = dedupeEmails([...parsedEmails.emails, ...parsed.emails]);
		setEmailInput(merged.join("\n"));
		setCsvMeta({
			fileName: file.name,
			rowCount: parsed.rowCount,
			emailCount: parsed.emails.length,
			invalidCount: parsed.invalid.length,
			hasHeader: parsed.hasHeader,
		});
		setFormError(parsed.invalid.length ? "Some CSV rows have invalid emails." : null);
	};

	const handleSendInvites = async () => {
		setFormError(null);
		clearStatus();

		if (!teamId) {
			setFormError("Team is still loading. Try again in a moment.");
			return;
		}

		if (!isAdmin) {
			setFormError("Only admins can send invites.");
			return;
		}

		if (parsedEmails.invalid.length) {
			setFormError("Remove invalid emails before sending.");
			return;
		}

		try {
			await sendInvites({
				teamId,
				role: inviteRole,
				emails: parsedEmails.emails,
				message: message.trim() || undefined,
				source: csvMeta ? "csv" : "manual",
			});
			setEmailInput("");
			setMessage("");
			setCsvMeta(null);
			await refresh();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Failed to send invites.");
		}
	};

	return (
		<div className="max-w-6xl space-y-6">
			<InviteHeader
				candidateCount={candidates.length}
				interviewerCount={interviewers.length}
			/>

			{(formError || status || error) && (
				<div className="rounded-lg border px-4 py-3 text-sm">
					{formError && (
						<div className="flex items-center gap-2 text-red-600">
							<AlertTriangle size={16} />
							<span>{formError}</span>
						</div>
					)}
					{status && (
						<div className={`flex items-center gap-2 ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
							{status.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
							<span>{status.message}</span>
						</div>
					)}
					{error && !status && (
						<div className="flex items-center gap-2 text-red-600">
							<AlertTriangle size={16} />
							<span>{error}</span>
						</div>
					)}
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
				<InviteFormPanel
					inviteRole={inviteRole}
					onRoleChange={setInviteRole}
					emailInput={emailInput}
					onEmailInputChange={setEmailInput}
					message={message}
					onMessageChange={setMessage}
					parsedEmails={parsedEmails}
					roles={settings.roles}
					departments={settings.departments}
					onSendInvites={handleSendInvites}
					onClear={() => {
						setEmailInput("");
						setMessage("");
						setCsvMeta(null);
						setFormError(null);
					}}
					canSend={canSend}
					isSending={isSending}
				/>
				<InviteSidebar
					csvMeta={csvMeta}
					onCsvUpload={handleCsvUpload}
					recentInvites={recentInvites}
					onResend={resendInvite}
					onDismiss={dismissInvite}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<AddInterviewers
					items={interviewers}
					isLoading={isLoading}
					error={error}
					onRemove={removeInterviewer}
					onRefresh={refresh}
				/>
				<AddInterviewees
					items={candidates}
					isLoading={isLoading}
					error={error}
					onRemove={removeCandidate}
					onRefresh={refresh}
				/>
			</div>
		</div>
	);
}
