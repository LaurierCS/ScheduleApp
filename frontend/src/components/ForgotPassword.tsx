import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");

	// Handle form submission for password recovery
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Password recovery requested for email:", email);
		// TODO: Implement password recovery API call
		// This will send a 6-digit verification code to the user's email
	};

	// Validate email format
	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-4">
					<h3 className="text-3xl font-medium">Forgot Password</h3>
				</div>

				{/* instructions */}
				<div className="text-center mb-10">
					<p className="text-base text-gray-600 leading-relaxed">
						Enter the email you used to create your account so we can 
						send you instructions on how to reset your password
					</p>
				</div>

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
					{/* Email text field with validation */}
					<div className="space-y-3">
						<label htmlFor="email" className="block text-base font-medium">
							Email
						</label>
						<Input
							id="email"
							type="email"
							className="w-full rounded-md h-12 text-base px-4 border border-black"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email address"
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

					{/* Send Code button with validation */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!email || !isValidEmail(email)}
					>
						Send Code
					</Button>
				</form>
			</div>
		</div>
	);
}