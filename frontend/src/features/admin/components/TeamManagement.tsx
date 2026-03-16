import { useMemo, useState } from "react";
import { Interviewee,Interviewer,initialInterviewees,initialInterviewers } from "./TeamManagementData";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-[110px] justify-center rounded-full bg-slate-300 px-4 py-2 text-xs font-medium text-slate-900">
      {children}
    </span>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-lg font-bold text-red-600 transition hover:text-red-700"
      aria-label="Remove from team"
      title="Remove from team"
      type="button"
    >
      ✕
    </button>
  );
}

export default function YourTeamView() {
  const [interviewers, setInterviewers] =
    useState<Interviewer[]>(initialInterviewers);
  const [interviewees, setInterviewees] =
    useState<Interviewee[]>(initialInterviewees);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

  const deptOptions = useMemo(() => {
    return ["All", ...new Set(interviewers.map((person) => person.dept))];
  }, [interviewers]);

  const roleOptions = useMemo(() => {
    return ["All", ...new Set(interviewees.map((person) => person.role))];
  }, [interviewees]);

  const filteredInterviewers = useMemo(() => {
    if (selectedDept === "All") return interviewers;
    return interviewers.filter((person) => person.dept === selectedDept);
  }, [interviewers, selectedDept]);

  const filteredInterviewees = useMemo(() => {
    if (selectedRole === "All") return interviewees;
    return interviewees.filter((person) => person.role === selectedRole);
  }, [interviewees, selectedRole]);

  const removeInterviewer = (id: number) => {
    setInterviewers((prev) => prev.filter((person) => person.id !== id));
  };

  const removeInterviewee = (id: number) => {
    setInterviewees((prev) => prev.filter((person) => person.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-4 md:p-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Team</h1>
        <p className="mt-2 text-sm text-slate-500">
          This is the availability of your entire team. This includes everyone
          who has been invited to join.
        </p>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label
                htmlFor="deptFilter"
                className="sr-only"
              >
                Filter by department
              </label>
              <select
                id="deptFilter"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0 focus:border-slate-300"
              >
                {deptOptions.map((dept) => (
                  <option
                    key={dept}
                    value={dept}
                  >
                    {dept === "All" ? "Filter by Dept" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Interviewers
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-300 text-xs font-semibold uppercase tracking-wide text-slate-900">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email Address</th>
                    <th className="px-4 py-4">Dept</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Remove From Team</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviewers.length > 0 ? (
                    filteredInterviewers.map((person) => (
                      <tr
                        key={person.id}
                        className="border-t border-slate-200 text-sm text-slate-700"
                      >
                        <td className="px-4 py-5 font-medium text-slate-900">
                          {person.name}
                        </td>
                        <td className="px-4 py-5 text-slate-500">
                          {person.email}
                        </td>
                        <td className="px-4 py-5">
                          <Pill>{person.dept}</Pill>
                        </td>
                        <td className="px-4 py-5">
                          <Pill>{person.status}</Pill>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <RemoveButton onClick={() => removeInterviewer(person.id)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No interviewers found for this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label
                htmlFor="roleFilter"
                className="sr-only"
              >
                Filter by role
              </label>
              <select
                id="roleFilter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none ring-0 focus:border-slate-300"
              >
                {roleOptions.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role === "All" ? "Filter by Role" : role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Interviewees
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-300 text-xs font-semibold uppercase tracking-wide text-slate-900">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email Address</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Remove From Team</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviewees.length > 0 ? (
                    filteredInterviewees.map((person) => (
                      <tr
                        key={person.id}
                        className="border-t border-slate-200 text-sm text-slate-700"
                      >
                        <td className="px-4 py-5 font-medium text-slate-900">
                          {person.name}
                        </td>
                        <td className="px-4 py-5 text-slate-500">
                          {person.email}
                        </td>
                        <td className="px-4 py-5">
                          <Pill>{person.role}</Pill>
                        </td>
                        <td className="px-4 py-5">
                          <Pill>{person.status}</Pill>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <RemoveButton onClick={() => removeInterviewee(person.id)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No interviewees found for this role.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}