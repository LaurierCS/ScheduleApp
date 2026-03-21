import { useState } from "react";

type ActiveTab = "interviewers" | "candidates";

type InviteFormState = {
	firstName: string;
	lastName: string;
	email: string;
	department: string;
	isSubmitting: boolean;
	successMessage: string;
	errorMessage: string;
	setFirstName: (value: string) => void;
	setLastName: (value: string) => void;
	setEmail: (value: string) => void;
	setDepartment: (value: string) => void;
	handleSendInvite: () => Promise<void>;
};

function useInviteForm(): InviteFormState {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [department, setDepartment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

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

	return {
		firstName,
		lastName,
		email,
		department,
		isSubmitting,
		successMessage,
		errorMessage,
		setFirstName,
		setLastName,
		setEmail,
		setDepartment,
		handleSendInvite,
	};
}

export function useAddInterviewers() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("interviewers");
	const interviewerInvite = useInviteForm();
	const candidateInvite = useInviteForm();

	return {
		activeTab,
		setActiveTab,
		interviewerInvite,
		candidateInvite,
	};
}
