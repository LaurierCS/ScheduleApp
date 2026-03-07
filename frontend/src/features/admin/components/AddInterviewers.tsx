import { useState } from "react";

interface AddInterviewersProps {
	departments?: string[];
}

export default function AddInterviewers({ departments = ["Engineering", "Design", "Marketing", "Product", "Operations"] }: AddInterviewersProps) {
	const [activeTab, setActiveTab] = useState<"interviewers" | "candidates">("interviewers");
	
	// Interviewer form state
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [department, setDepartment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	// Candidate form state
	const [candidateFirstName, setCandidateFirstName] = useState("");
	const [candidateLastName, setCandidateLastName] = useState("");
	const [candidateEmail, setCandidateEmail] = useState("");
	const [candidateDepartment, setCandidateDepartment] = useState("");
	const [isCandidateSubmitting, setIsCandidateSubmitting] = useState(false);
	const [candidateSuccessMessage, setCandidateSuccessMessage] = useState("");
	const [candidateErrorMessage, setCandidateErrorMessage] = useState("");

	const handleSendInvite = async () => {
		setSuccessMessage("");
		setErrorMessage("");

		if (!firstName || !lastName || !email || !department) {
			setErrorMessage("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setErrorMessage("Please enter a valid email address.");
			return;
		}

		try {
			setIsSubmitting(true);
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			setSuccessMessage(`Invite sent to ${email} successfully.`);
			setFirstName("");
			setLastName("");
			setEmail("");
			setDepartment("");
		} catch (err) {
			setErrorMessage("Failed to send invite. Please try again.");
			console.log(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSendCandidateInvite = async () => {
		setCandidateSuccessMessage("");
		setCandidateErrorMessage("");

		if (!candidateFirstName || !candidateLastName || !candidateEmail || !candidateDepartment) {
			setCandidateErrorMessage("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(candidateEmail)) {
			setCandidateErrorMessage("Please enter a valid email address.");
			return;
		}

		try {
			setIsCandidateSubmitting(true);
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			setCandidateSuccessMessage(`Invite sent to ${candidateEmail} successfully.`);
			setCandidateFirstName("");
			setCandidateLastName("");
			setCandidateEmail("");
			setCandidateDepartment("");
		} catch (err) {
			setCandidateErrorMessage("Failed to send invite. Please try again.");
			console.log(err);
		} finally {
			setIsCandidateSubmitting(false);
		}
	};

	const formUI = (
		values: { firstName: string; lastName: string; email: string; department: string },
		handlers: {
			setFirstName: (v: string) => void;
			setLastName: (v: string) => void;
			setEmail: (v: string) => void;
			setDepartment: (v: string) => void;
		},
		isSubmitting: boolean,
		successMessage: string,
		errorMessage: string,
		handleSubmit: () => void
	) => (
		<div>
			<p className="text-base font-semibold text-gray-700 mb-4">Add Information</p>

			{successMessage && (
				<div className="mb-4 text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
					{successMessage}
				</div>
			)}
			{errorMessage && (
				<div className="mb-4 text-base text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
					{errorMessage}
				</div>
			)}

			<div className="mb-5">
				<label className="block text-base text-gray-600 mb-2">First name</label>
				<input
					type="text"
					value={values.firstName}
					onChange={(e) => handlers.setFirstName(e.target.value)}
					className="w-full px-4 py-3 bg-gray-100 rounded-md text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
			</div>

			<div className="mb-5">
				<label className="block text-base text-gray-600 mb-2">Last name</label>
				<input
					type="text"
					value={values.lastName}
					onChange={(e) => handlers.setLastName(e.target.value)}
					className="w-full px-4 py-3 bg-gray-100 rounded-md text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
			</div>

			<div className="mb-5">
				<label className="block text-base text-gray-600 mb-2">Email address</label>
				<input
					type="email"
					value={values.email}
					onChange={(e) => handlers.setEmail(e.target.value)}
					className="w-full px-4 py-3 bg-gray-100 rounded-md text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
			</div>

			<div className="mb-8">
				<label className="block text-base text-gray-600 mb-2">Department</label>
				<select
					value={values.department}
					onChange={(e) => handlers.setDepartment(e.target.value)}
					className="w-64 px-4 py-3 bg-gray-100 rounded-md text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
				>
					<option value="">Select</option>
					{departments.map((dept) => (
						<option key={dept} value={dept}>
							{dept}
						</option>
					))}
				</select>
			</div>

			<div className="flex justify-end">
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-base font-medium px-6 py-3 rounded-lg transition-colors"
				>
					{isSubmitting ? "Sending..." : "Send Invite"}
				</button>
			</div>
		</div>
	);
    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900">Add Team Members</h1>
                <p className="text-gray-500 text-base mt-1 mb-6">
                    Send invitations for interviewers and candidates to join your team!
                </p>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("interviewers")}
                            className={`pb-3 px-4 text-base font-medium transition-colors ${
                                activeTab === "interviewers"
                                    ? "border-b-2 border-gray-900 text-gray-900"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Add Interviewers
                        </button>
                        <button
                            onClick={() => setActiveTab("candidates")}
                            className={`pb-3 px-4 text-base font-medium transition-colors ${
                                activeTab === "candidates"
                                    ? "border-b-2 border-gray-900 text-gray-900"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Add Candidates
                        </button>
                    </div>
                </div>

                <div key={activeTab} style={{ animation: "fadeIn 0.2s ease-in-out" }}>
                    {activeTab === "interviewers"
                        ? formUI(
                                { firstName, lastName, email, department },
                                { setFirstName, setLastName, setEmail, setDepartment },
                                isSubmitting,
                                successMessage,
                                errorMessage,
                                handleSendInvite
                        )
                        : formUI(
                                { firstName: candidateFirstName, lastName: candidateLastName, email: candidateEmail, department: candidateDepartment },
                                { setFirstName: setCandidateFirstName, setLastName: setCandidateLastName, setEmail: setCandidateEmail, setDepartment: setCandidateDepartment },
                                isCandidateSubmitting,
                                candidateSuccessMessage,
                                candidateErrorMessage,
                                handleSendCandidateInvite
                        )}
                </div>
            </div>
        </>
    );
}