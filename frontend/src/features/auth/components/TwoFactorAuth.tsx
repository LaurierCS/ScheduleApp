import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function TwoFactorAuth() {
	const [code, setCode] = useState("");

	// Handle input change for verification code
	const handleInputChange = (value: string) => {
		// Only allow digits and limit to 6 characters
		if (value.length > 6 || (value && !/^\d*$/.test(value))) return;
		setCode(value);
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("2FA code submitted:", code);
		// TODO: Implement 2FA verification API call
	};

	// Check if code is complete (6 digits)
	const isCodeComplete = code.length === 6;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-4">
					<h3 className="text-3xl font-medium">Two-Factor Authentication</h3>
				</div>

				{/* Instructions */}
				<div className="text-center mb-6">
					<p className="text-base text-gray-600 leading-relaxed mb-2">
						You can use any two-factor authentication application, like 
						Google Authenticator, Microsoft Authenticator, and Twilio Authy.
					</p>
				</div>

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
					{/* 2FA Code input field */}
					<div className="space-y-3">
						<label htmlFor="2faCode" className="block text-base font-medium">
							2FA Code
						</label>
						<Input
							id="2faCode"
							type="text"
							inputMode="numeric"
							className="w-full rounded-md h-12 text-base px-4 border border-black"
							value={code}
							onChange={(e) => handleInputChange(e.target.value)}
							placeholder="Enter 6-digit code"
							maxLength={6}
							required
						/>
					</div>

					{/* Back to login page */}
					<div className="flex justify-start">
						<Link 
							to="/signin" 
							className="text-base font-medium text-primary hover:underline underline flex items-center gap-2"
						>
							<ArrowLeft size={18} />
							Back To Login
						</Link>
					</div>

					{/* Confirm button */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!isCodeComplete}
					>
						Confirm
					</Button>
				</form>
			</div>
		</div>
	);
}
