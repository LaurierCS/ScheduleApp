import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFormValidation } from "../hooks/useFormValidation";
import { FormInput } from "./ui/FormInput";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const { validationError, setValidationError, clearError, isEmailValid } = useFormValidation();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		if (!email) {
			setValidationError("Please enter your email");
			return;
		}

		if (!isEmailValid(email)) {
			setValidationError("Please enter a valid email");
			return;
		}

		console.log("Password recovery requested for email:", email);
		// TODO: Implement password recovery API call
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

				{/* Error message */}
				{validationError && (
					<div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
						{validationError}
					</div>
				)}

				<form className="space-y-8 w-full" onSubmit={handleSubmit}>
					{/* Email input */}
					<FormInput
						id="email"
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email address"
						required
					/>

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

					{/* Send Code button */}
					<Button
						type="submit"
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
						disabled={!email || !isEmailValid(email)}
					>
						Send Code
					</Button>
				</form>
			</div>
		</div>
	);
}