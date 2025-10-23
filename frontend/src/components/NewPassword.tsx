import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function NewPassword() {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Handle form submission for password
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("New password created");
		// TODO: Implement password update API call
	};

	// Password validation
	const passwordValidation = {
		minLength: newPassword.length >= 8,
		hasUppercase: /[A-Z]/.test(newPassword),
		hasLowercase: /[a-z]/.test(newPassword),
		hasNumber: /\d/.test(newPassword),
		hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
	};

	// Check if passwords match
	const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

	// Check if criteria is met
	const isPasswordValid = Object.values(passwordValidation).every(Boolean);

	// Check if form is valid
	const isFormValid = isPasswordValid && passwordsMatch;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-4">
					<h3 className="text-3xl font-medium">Set New Password</h3>
				</div>

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
					{/* New Password input */}
					<div className="space-y-3">
						<label htmlFor="newPassword" className="block text-base font-medium">
							New Password
						</label>
						<div className="relative">
							<Input
								id="newPassword"
								type={showNewPassword ? "text" : "password"}
								className="w-full rounded-md h-12 text-base px-4 pr-12 border border-black"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Enter new password"
								required
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent focus:outline-none"
								onClick={() => setShowNewPassword(!showNewPassword)}
							>
								{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{/* Confirm Password */}
					<div className="space-y-3">
						<label htmlFor="confirmPassword" className="block text-base font-medium">
							Confirm New Password
						</label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								className="w-full rounded-md h-12 text-base px-4 pr-12 border border-black"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								required
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent focus:outline-none"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{/* Password requirements */}
					<div className="grid grid-cols-2 gap-x-8 gap-y-2">
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}`}>
								Use 8 or more characters
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-600'}`}>
								One Uppercase character
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-600'}`}>
								One lowercase character
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-600'}`}>
								One special character
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
								One number
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`w-2 h-2 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-gray-300'}`}></div>
							<span className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-gray-600'}`}>
								Passwords match
							</span>
						</div>
					</div>

					{/* Save button */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!isFormValid}
					>
						Save
					</Button>
				</form>
			</div>
		</div>
	);
}