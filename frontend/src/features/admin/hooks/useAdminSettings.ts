import { useState } from "react";
import {
	defaultInterviewersPerInterviewee,
	defaultMaxInterviewsPerDay,
	mockDepartments,
	mockModerators,
	mockRoles,
	type Department,
	type Moderator,
	type Role,
} from "../components/mockData/adminSettingsMockData";

export function useAdminSettings() {
	const [moderators, setModerators] = useState<Moderator[]>(mockModerators);
	const [roles, setRoles] = useState<Role[]>(mockRoles);
	const [departments, setDepartments] = useState<Department[]>(mockDepartments);
	const [interviewersPerInterviewee, setInterviewersPerInterviewee] = useState<number>(defaultInterviewersPerInterviewee);
	const [maxInterviewsPerDay, setMaxInterviewsPerDay] = useState<number>(defaultMaxInterviewsPerDay);

	const [showRoleInput, setShowRoleInput] = useState(false);
	const [newRoleName, setNewRoleName] = useState("");
	const [showDeptInput, setShowDeptInput] = useState(false);
	const [newDeptName, setNewDeptName] = useState("");
	const [showModeratorInput, setShowModeratorInput] = useState(false);
	const [newModeratorEmail, setNewModeratorEmail] = useState("");

	const removeModerator = (id: string) => {
		setModerators(moderators.filter((mod) => mod.id !== id));
	};

	const removeRole = (id: string) => {
		setRoles(roles.filter((role) => role.id !== id));
	};

	const removeDepartment = (id: string) => {
		setDepartments(departments.filter((dept) => dept.id !== id));
	};

	const addRole = () => {
		if (newRoleName.trim()) {
			setRoles([...roles, { id: Date.now().toString(), name: newRoleName.trim() }]);
			setNewRoleName("");
			setShowRoleInput(false);
		}
	};

	const addDepartment = () => {
		if (newDeptName.trim()) {
			setDepartments([...departments, { id: Date.now().toString(), name: newDeptName.trim() }]);
			setNewDeptName("");
			setShowDeptInput(false);
		}
	};

	const inviteModerator = () => {
		if (newModeratorEmail.trim()) {
			console.log("Inviting moderator:", newModeratorEmail);
			setModerators([
				...moderators,
				{
					id: Date.now().toString(),
					name: "Pending",
					email: newModeratorEmail.trim(),
				},
			]);
			setNewModeratorEmail("");
			setShowModeratorInput(false);
			alert(`Invite sent to ${newModeratorEmail}`);
		}
	};

	const handleSave = () => {
		console.log("Saving settings:", {
			moderators,
			roles,
			departments,
			interviewersPerInterviewee,
			maxInterviewsPerDay,
		});
		alert("Settings saved successfully!");
	};

	return {
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
	};
}
