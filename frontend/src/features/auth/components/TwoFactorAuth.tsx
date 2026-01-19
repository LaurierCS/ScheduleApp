import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { verifyResetCode, setTokens } from "../services/authApi";
import { FormInput } from "./ui/FormInput";

export default function TwoFactorAuth() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Load email from session storage on mount
	useEffect(() => {
		const storedEmail = sessionStorage.getItem('resetEmail');
		if (storedEmail) {
			setEmail(storedEmail);
		} else {
			// Redirect back to forgot password if no email
			navigate("/forgot-password");
		}
	}, [navigate]);

	// Handle code input change - only allow digits, max 6
	const handleCodeChange = (value: string) => {
		if (value.length > 6 || (value && !/^\d*$/.test(value))) return;
		setCode(value);
		setError("");
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!code || code.length !== 6) {
			setError("Please enter a 6-digit code");
			return;
		}

		setLoading(true);
		try {
			const response = await verifyResetCode({ 
				email,
				code 
			});

			// Store the reset token for password update
			if (response && response.data && response.data.resetToken) {
				setTokens(response.data.resetToken, '');
			}

			// Clear session email and navigate to password reset
			sessionStorage.removeItem('resetEmail');
			navigate("/new-password");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Check if code is complete (6 digits)
	const isCodeComplete = code.length === 6;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-4">
					<h3 className="text-3xl font-medium">Verify Your Email</h3>
				</div>

				{/* Instructions */}
				<div className="text-center mb-6">
					<p className="text-base text-gray-600 leading-relaxed">
						A 6-digit verification code has been sent to your email. Enter the code below to reset your password.
					</p>
				</div>

				{/* Error message */}
				{error && (
					<div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
						{error}
					</div>
				)}

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
					{/* Email display (read-only) */}
					<FormInput
						id="email"
						label="Email"
						type="email"
						value={email}
						disabled
						placeholder="Your email address"
						required
					/>

					{/* 2FA Code input */}
					<div className="space-y-3">
						<label htmlFor="code" className="block text-base font-medium">
							Verification Code
						</label>
						<Input
							id="code"
							type="text"
							inputMode="numeric"
							className="w-full rounded-md h-12 text-base px-4 border border-black"
							value={code}
							onChange={(e) => handleCodeChange(e.target.value)}
							placeholder="Enter 6-digit code"
							maxLength={6}
							required
						/>
					</div>

					{/* Back to forgot password */}
					<div className="flex justify-start">
						<Link 
							to="/forgot-password" 
							className="text-base font-medium text-primary hover:underline flex items-center gap-2"
						>
							<ArrowLeft size={18} />
							Back To Email
						</Link>
					</div>

					{/* Verify button */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!isCodeComplete || loading}
					>
						{loading ? "Verifying..." : "Verify Code"}
					</Button>
				</form>
			</div>
		</div>
	);
}
