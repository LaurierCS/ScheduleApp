import { RefreshCw, Trash2 } from "lucide-react";
import type { TeamInterviewer } from "../types";

type Props = {
  items: TeamInterviewer[];
  isLoading: boolean;
  error: string | null;
  onRemove: (id: string) => void;
  onRefresh: () => void;
};

const statusTone = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "inactive":
      return "bg-amber-100 text-amber-700";
    case "pending":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AddInterviewers({
  items,
  isLoading,
  error,
  onRemove,
  onRefresh,
}: Props) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Interviewers</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">Hiring team</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
          {items.length}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-700"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">No interviewers yet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((interviewer) => (
            <div
              key={interviewer.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{interviewer.name}</p>
                <p className="text-xs text-gray-500">{interviewer.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(
                    interviewer.status
                  )}`}
                >
                  {interviewer.status || "pending"}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(interviewer.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
