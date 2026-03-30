import { Upload } from "lucide-react";
import type { InviteCsvSummary, RecentInvite } from "../types";

type Props = {
  csvMeta: InviteCsvSummary | null;
  onCsvUpload: (file: File | null) => void;
  recentInvites: RecentInvite[];
  onResend: (invite: RecentInvite) => void;
  onDismiss: (id: string) => void;
};

export default function InviteSidebar({
  csvMeta,
  onCsvUpload,
  recentInvites,
  onResend,
  onDismiss,
}: Props) {
  return (
    <aside className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">CSV import</p>
            <h3 className="mt-2 text-base font-semibold text-gray-900">Upload a list</h3>
          </div>
          <Upload size={18} className="text-gray-400" />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          CSV must include an email column. We only read the email values.
        </p>
        <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-xs font-semibold text-gray-600">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onCsvUpload(file);
              event.currentTarget.value = "";
            }}
          />
          Click to upload CSV
        </label>
        {csvMeta && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            <p className="font-semibold">{csvMeta.fileName}</p>
            <p className="text-gray-500">
              Rows: {csvMeta.rowCount} | Emails: {csvMeta.emailCount} | Invalid: {csvMeta.invalidCount}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Recent</p>
            <h3 className="mt-2 text-base font-semibold text-gray-900">Invite activity</h3>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {recentInvites.length}
          </span>
        </div>
        {recentInvites.length === 0 ? (
          <p className="mt-4 text-xs text-gray-500">No invites sent yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-800">{invite.email}</p>
                  <p className="text-[11px] text-gray-500">
                    {invite.role} • {invite.source} • {new Date(invite.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResend(invite)}
                    className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600"
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismiss(invite.id)}
                    className="rounded-md border border-transparent px-2.5 py-1 text-[11px] font-semibold text-gray-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
