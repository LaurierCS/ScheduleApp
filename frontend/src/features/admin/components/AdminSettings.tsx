import { X } from "lucide-react";
import { useAdminSettings } from "../hooks";

export default function AdminSettings() {
	const {
		moderators,
		roles,
		departments,
		interviewersPerInterviewee,
		maxInterviewsPerDay,
		showRoleInput,
		newRoleName,
		showDeptInput,
		newDeptName,
		showModeratorInput,
		newModeratorEmail,
		setInterviewersPerInterviewee,
		setMaxInterviewsPerDay,
		setShowRoleInput,
		setNewRoleName,
		setShowDeptInput,
		setNewDeptName,
		setShowModeratorInput,
		setNewModeratorEmail,
		removeModerator,
		removeRole,
		removeDepartment,
		addRole,
		addDepartment,
		inviteModerator,
		handleSave,
	} = useAdminSettings();

	return (
		<div className="space-y-6 max-w-7xl">
			{/* Header */}
			<h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>

			{/* Moderators Section */}
			<div className="bg-white p-8 rounded-xl border border-gray-200">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-gray-900">Team Moderators</h2>
					<button
						onClick={() => setShowModeratorInput(!showModeratorInput)}
						className="px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors"
					>
						+ Invite
					</button>
				</div>

				{showModeratorInput && (
					<div className="mb-5 flex gap-2">
						<input
							type="email"
							value={newModeratorEmail}
							onChange={(e) => setNewModeratorEmail(e.target.value)}
							placeholder="Enter moderator email"
							className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							onKeyPress={(e) => e.key === "Enter" && inviteModerator()}
						/>
						<button
							onClick={inviteModerator}
							className="px-5 py-3 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors"
						>
							Send Invite
						</button>
						<button
							onClick={() => {
								setShowModeratorInput(false);
								setNewModeratorEmail("");
							}}
							className="px-5 py-3 bg-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-400 transition-colors"
						>
							Cancel
						</button>
					</div>
				)}

				<div className="flex flex-wrap gap-2">
					{moderators.map((moderator) => (
						<div
							key={moderator.id}
							className="inline-flex items-center gap-1.5 bg-gray-100 rounded-md px-4 py-2 text-base"
						>
							<span className="text-gray-700">
								{moderator.name}
								{moderator.isMain && (
									<span className="text-gray-500 text-sm ml-1">(main)</span>
								)}
							</span>
							{!moderator.isMain && (
								<button
									onClick={() => removeModerator(moderator.id)}
									className="text-gray-400 hover:text-red-500 transition-colors ml-1"
								>
									<X size={16} />
								</button>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Auto Scheduling Preferences Section */}
			<div className="bg-white p-8 rounded-xl border border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900 mb-6">
					Auto Scheduling Preferences
				</h2>
				<div className="space-y-6">
					<div>
						<label className="block text-base font-medium text-gray-700 mb-2">
							Number of Interviewers per Interviewee
						</label>
						<input
							type="number"
							min="1"
							value={interviewersPerInterviewee}
							onChange={(e) => setInterviewersPerInterviewee(parseInt(e.target.value) || 0)}
							className="w-full md:w-48 px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., 2"
						/>
						<p className="text-sm text-gray-500 mt-2">
							Set how many interviewers should meet with each candidate
						</p>
					</div>
					<div>
						<label className="block text-base font-medium text-gray-700 mb-2">
							Max Interviews per Day per Interviewer
						</label>
						<input
							type="number"
							min="1"
							value={maxInterviewsPerDay}
							onChange={(e) => setMaxInterviewsPerDay(parseInt(e.target.value) || 0)}
							className="w-full md:w-48 px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., 5"
						/>
						<p className="text-sm text-gray-500 mt-2">
							Limit daily interviews to prevent interviewer burnout
						</p>
					</div>
				</div>
			</div>

			{/* Two Column Layout for Roles and Departments */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Manage Roles Section */}
				<div className="bg-white p-8 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">Interview Roles</h2>
						<button
							onClick={() => setShowRoleInput(!showRoleInput)}
							className="px-4 py-2 bg-gray-600 text-white text-base rounded-md hover:bg-gray-700 transition-colors"
						>
							+ Add
						</button>
					</div>
					<p className="text-sm text-gray-500 mb-4">Roles available for interviewees</p>

					{showRoleInput && (
						<div className="mb-4 flex gap-2">
							<input
								type="text"
								value={newRoleName}
								onChange={(e) => setNewRoleName(e.target.value)}
								placeholder="Enter role name"
								className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								onKeyPress={(e) => e.key === "Enter" && addRole()}
							/>
							<button
								onClick={addRole}
								className="px-4 py-3 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700"
							>
								Add
							</button>
							<button
								onClick={() => {
									setShowRoleInput(false);
									setNewRoleName("");
								}}
								className="px-4 py-3 bg-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-400"
							>
								Cancel
							</button>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						{roles.map((role) => (
							<div
								key={role.id}
								className="inline-flex items-center gap-1.5 bg-gray-100 rounded-md px-4 py-2 text-base"
							>
								<span className="text-gray-700">{role.name}</span>
								<button
									onClick={() => removeRole(role.id)}
									className="text-gray-400 hover:text-red-500 transition-colors ml-1"
								>
									<X size={16} />
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Manage Departments Section */}
				<div className="bg-white p-8 rounded-xl border border-gray-200">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">Departments</h2>
						<button
							onClick={() => setShowDeptInput(!showDeptInput)}
							className="px-4 py-2 bg-gray-600 text-white text-base rounded-md hover:bg-gray-700 transition-colors"
						>
							+ Add
						</button>
					</div>
					<p className="text-sm text-gray-500 mb-4">Departments for interviewers</p>

					{showDeptInput && (
						<div className="mb-4 flex gap-2">
							<input
								type="text"
								value={newDeptName}
								onChange={(e) => setNewDeptName(e.target.value)}
								placeholder="Enter department name"
								className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								onKeyPress={(e) => e.key === "Enter" && addDepartment()}
							/>
							<button
								onClick={addDepartment}
								className="px-4 py-3 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700"
							>
								Add
							</button>
							<button
								onClick={() => {
									setShowDeptInput(false);
									setNewDeptName("");
								}}
								className="px-4 py-3 bg-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-400"
							>
								Cancel
							</button>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						{departments.map((dept) => (
							<div
								key={dept.id}
								className="inline-flex items-center gap-1.5 bg-gray-100 rounded-md px-4 py-2 text-base"
							>
								<span className="text-gray-700">{dept.name}</span>
								<button
									onClick={() => removeDepartment(dept.id)}
									className="text-gray-400 hover:text-red-500 transition-colors ml-1"
								>
									<X size={16} />
								</button>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-2 pb-8">
				<button
					onClick={handleSave}
					className="px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-700 transition-colors"
				>
					Save Changes
				</button>
			</div>
		</div>
	);
}