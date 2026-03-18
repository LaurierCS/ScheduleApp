import { useState } from "react";
import AddInterviewers from "./AddInterviewers";
import AddInterviewees from "./AddInterviewees";

type Tab = "interviewers" | "interviewees";

export default function AddTeamMembers() {
	const [activeTab, setActiveTab] = useState<Tab>("interviewers");

	return (
		<div className="max-w-4xl space-y-6">
			<h1 className="text-3xl font-bold text-gray-900">Team Management</h1>

			<div className="flex gap-6 border-b border-gray-200 pb-0">
				<button
					onClick={() => setActiveTab("interviewers")}
					className={`pb-3 text-sm font-medium transition-colors ${
						activeTab === "interviewers"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					Add Interviewers
				</button>
				<button
					onClick={() => setActiveTab("interviewees")}
					className={`pb-3 text-sm font-medium transition-colors ${
						activeTab === "interviewees"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					Add Interviewees
				</button>
			</div>

			<div>
				{activeTab === "interviewers" ? <AddInterviewers /> : <AddInterviewees />}
			</div>
		</div>
	);
}
