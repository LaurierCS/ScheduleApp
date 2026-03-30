import { Send } from "lucide-react";
import type { InviteRole } from "../types";

type Props = {
  inviteRole: InviteRole;
  onRoleChange: (role: InviteRole) => void;
  emailInput: string;
  onEmailInputChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  parsedEmails: { emails: string[]; invalid: string[] };
  roles: string[];
  departments: string[];
  onSendInvites: () => void;
  onClear: () => void;
  canSend: boolean;
  isSending: boolean;
};

export default function InviteFormPanel({
  inviteRole,
  onRoleChange,
  emailInput,
  onEmailInputChange,
  message,
  onMessageChange,
  parsedEmails,
  roles,
  departments,
  onSendInvites,
  onClear,
  canSend,
  isSending,
}: Props) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Invite flow</p>
          <h2 className="mt-2 text-lg font-semibold text-gray-900">Send team invitations</h2>
          <p className="mt-1 text-xs text-gray-500">
            We email a six-digit code to each recipient. They enter it during signup to join.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => onRoleChange("candidate")}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              inviteRole === "candidate"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => onRoleChange("interviewer")}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              inviteRole === "interviewer"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            Interviewer
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="invite-emails" className="text-sm font-medium text-gray-700">
            Invite emails
          </label>
          <textarea
            id="invite-emails"
            value={emailInput}
            onChange={(event) => onEmailInputChange(event.target.value)}
            placeholder="Paste emails separated by commas or new lines"
            rows={5}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-0"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>{parsedEmails.emails.length} ready</span>
            {parsedEmails.invalid.length > 0 && (
              <span className="text-rose-600">{parsedEmails.invalid.length} invalid</span>
            )}
            {roles.length > 0 && inviteRole === "candidate" && (
              <span>Roles: {roles.join(", ")}</span>
            )}
            {departments.length > 0 && inviteRole === "interviewer" && (
              <span>Depts: {departments.join(", ")}</span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="invite-message" className="text-sm font-medium text-gray-700">
            Optional note
          </label>
          <textarea
            id="invite-message"
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder="Add a short note for the invite email"
            rows={3}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSendInvites}
            disabled={!canSend}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {isSending ? "Sending..." : "Send invites"}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
