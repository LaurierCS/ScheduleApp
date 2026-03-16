import { useState, useEffect, useContext } from "react";
import { X, Briefcase } from "lucide-react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { authenticatedFetch } from "@/features/auth/utils/authClient";
import { getCurrentUser } from "@/features/auth/services/authApi";

interface Interviewer {
	id: string;
	name: string;
	email: string;
	department?: string;
}

export default function AddInterviewers() {
	const auth = useContext(AuthContext);
	const user = auth?.user;

	const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
	const [departments, setDepartments] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [fetchKey, setFetchKey] = useState(0);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [department, setDepartment] = useState("");
	const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);


	useEffect(() => {
		if (auth?.isLoading) return;
		if (!user) { setIsLoading(false); return; }
		if (!user.teamId) {
			getCurrentUser()
				.then((fresh) => { if (fresh.teamId) auth?.setUser(fresh); else setIsLoading(false); })
				.catch(() => setIsLoading(false));
			return;
		}
		const fetchInterviewers = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const [interviewersRes, settingsRes] = await Promise.all([
					authenticatedFetch(`/teams/${user.teamId}/interviewers`),
					authenticatedFetch(`/teams/${user.teamId}/settings`),
				]);
				const interviewersData = await interviewersRes.json();
				if (!interviewersRes.ok) throw new Error(interviewersData?.message || `Error ${interviewersRes.status}`);
				const raw = interviewersData.data || [];
				setInterviewers(
					raw.map((i: { _id?: string; id?: string; name: string; email: string; department?: string }) => ({
						id: i._id || i.id,
						name: i.name,
						email: i.email,
						department: i.department,
					}))
				);
				if (settingsRes.ok) {
					const settingsData = await settingsRes.json();
					console.log("[AddInterviewers] settings response:", settingsData);
					setDepartments(settingsData.data?.departments || []);
				} else {
					console.warn("[AddInterviewers] settings fetch failed:", settingsRes.status);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load interviewers");
			} finally {
				setIsLoading(false);
			}
		};
		fetchInterviewers();
	}, [user?.id, user?.teamId, auth?.isLoading, fetchKey]);

	const sendInvite = async () => {
		if (!firstName.trim() || !lastName.trim()) {
			setStatus({ type: "error", message: "First and last name are required." });
			return;
		}
		if (!email.trim()) {
			setStatus({ type: "error", message: "Email is required." });
			return;
		}

		try {
			const fullName = `${firstName.trim()} ${lastName.trim()}`;
			const response = await authenticatedFetch(`/teams/${user?.teamId}/members/batch`, {
				method: "POST",
				body: JSON.stringify({
					emails: [email.trim()],
					role: "interviewer",
					name: fullName,
					department: department || undefined,
				}),
			});
			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data?.message || "Failed to send invite");
			}
			setStatus({ type: "success", message: `Invite sent to ${email.trim()}.` });
			setFirstName(""); setLastName(""); setEmail(""); setDepartment("");
			setFetchKey(k => k + 1);
		} catch (err) {
			setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to send invite" });
		}
	};

	const removeInterviewer = async (id: string) => {
		try {
			const response = await authenticatedFetch(`/interviewers/${id}`, { method: "DELETE" });
			if (!response.ok) throw new Error("Failed to remove interviewer");
			setInterviewers(interviewers.filter((i) => i.id !== id));
		} catch (err) {
			setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to remove interviewer" });
		}
	};

	return (
		<div className="space-y-6">
			{status && (
				<div
					className={`p-3 rounded-md text-sm ${
						status.type === "success"
							? "bg-green-50 text-green-700 border border-green-200"
							: "bg-red-50 text-red-700 border border-red-200"
					}`}
				>
					{status.message}
					<button className="ml-2 underline text-xs" onClick={() => setStatus(null)}>
						dismiss
					</button>
				</div>
			)}

			<div className="bg-white p-6 rounded-lg shadow-sm">
				<div className="flex items-center gap-2 mb-5">
					<Briefcase size={20} className="text-gray-600" />
					<h2 className="text-lg font-semibold text-gray-900">Invite Interviewer</h2>
				</div>

				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
							<input
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="First name"
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
							<input
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Last name"
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email address"
							className="w-full md:w-96 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
						<select
							value={department}
							onChange={(e) => setDepartment(e.target.value)}
							className="w-full md:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Select department</option>
							{departments.map((d) => (
								<option key={d} value={d}>{d}</option>
							))}
						</select>
						{departments.length === 0 && (
							<p className="text-xs text-gray-400 mt-1">No departments configured. Add them in Admin Settings.</p>
						)}
					</div>

					<div>
						<button
							onClick={sendInvite}
							className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
						>
							Send Invite
						</button>
					</div>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<h2 className="text-lg font-semibold text-gray-900">Interviewers</h2>
					{!isLoading && (
						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
							{interviewers.length}
						</span>
					)}
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
								<div className="h-8 w-8 bg-gray-200 rounded-full" />
								<div className="flex-1 space-y-1">
									<div className="h-4 w-32 bg-gray-200 rounded" />
									<div className="h-3 w-48 bg-gray-200 rounded" />
								</div>
							</div>
						))}
					</div>
				) : (
					<>
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between mb-3">
								<p className="text-sm text-red-600">{error}</p>
								<button onClick={() => setFetchKey(k => k + 1)} className="text-xs text-red-500 underline ml-3">Retry</button>
							</div>
						)}
						{interviewers.length === 0 ? (
							<p className="text-sm text-gray-500 text-center py-8">No interviewers yet.</p>
						) : (
							<div className="space-y-2">
								{interviewers.map((interviewer) => (
									<div
										key={interviewer.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
									>
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
												{interviewer.name.charAt(0).toUpperCase()}
											</div>
											<div>
												<p className="text-sm font-medium text-gray-800">{interviewer.name}</p>
												<p className="text-xs text-gray-500">{interviewer.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{interviewer.department && (
												<span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
													{interviewer.department}
												</span>
											)}
											<button
												onClick={() => removeInterviewer(interviewer.id)}
												className="text-gray-400 hover:text-red-500 transition-colors"
											>
												<X size={15} />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
