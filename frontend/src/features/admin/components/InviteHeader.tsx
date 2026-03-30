type Props = {
  candidateCount: number;
  interviewerCount: number;
};

export default function InviteHeader({ candidateCount, interviewerCount }: Props) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Team invites</p>
        <h1 className="text-3xl font-bold text-gray-900">Build the next cohort</h1>
        <p className="text-sm text-gray-600">
          Invite candidates by default or switch to interviewers. New members get a
          six-digit code by email to join during signup.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500">Candidates</p>
          <p className="text-2xl font-semibold text-gray-900">{candidateCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500">Interviewers</p>
          <p className="text-2xl font-semibold text-gray-900">{interviewerCount}</p>
        </div>
      </div>
    </header>
  );
}
