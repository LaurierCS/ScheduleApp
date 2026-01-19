import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePasswordValidation, isPasswordValid } from "../hooks/usePasswordValidation";
import { useFormValidation } from "../hooks/useFormValidation";
import { resetPassword } from "../services/authApi";
import { FormPasswordInput } from "./ui/FormPasswordInput";
import { PasswordRequirements } from "./ui/PasswordRequirements";

export default function NewPassword() {
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { validationError, setValidationError, clearError } = useFormValidation();

	// Password validation
	const passwordChecks = usePasswordValidation(newPassword);
	const isPasswordOk = isPasswordValid(passwordChecks);
	const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
	const isFormValid = isPasswordOk && passwordsMatch;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		if (!isFormValid) {
			setValidationError("Please complete all password requirements");
			return;
		}

		setLoading(true);
		try {
			await resetPassword({
				newPassword,
				confirmPassword,
			});

			// Redirect to success page
			navigate("/new-password-made");
		} catch (error) {
			let errorMessage = 'Failed to reset password';
			
			if (error instanceof Error) {
				errorMessage = error.message;
			}

			// Display the error message directly from the server
			setValidationError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-4">
					<h3 className="text-3xl font-medium">Set New Password</h3>
				</div>

				{/* Error message */}
				{validationError && (
					<div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
						{validationError}
					</div>
				)}

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
			{/* New Password input */}
			<FormPasswordInput
				id="newPassword"
				label="New Password"
				value={newPassword}
				onChange={(e) => setNewPassword(e.target.value)}
				placeholder="Enter new password"
				required
			/>
					{/* Confirm Password */}
					<FormPasswordInput
						id="confirmPassword"
						label="Confirm New Password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm new password"
						required
					/>

					{/* Password requirements */}
					<PasswordRequirements 
						validation={passwordChecks} 
						showPasswordsMatch={true}
						passwordsMatch={passwordsMatch}
						responsive={false}
					/>

					{/* Save button */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!isFormValid || loading}
					>
						{loading ? "Updating..." : "Save"}
					</Button>
				</form>
			</div>
		</div>
	);
}