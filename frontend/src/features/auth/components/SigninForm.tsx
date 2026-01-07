"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDashboardPath } from "@/utils/navigation";
import { useFormValidation } from "../hooks/useFormValidation";
import { FormInput } from "./ui/FormInput";
import { FormPasswordInput } from "./ui/FormPasswordInput";

export default function SigninForm() {
	// ============================================================================
	// HOOKS & STATE
	// ============================================================================
	
	const { login, isLoading, error, clearError } = useAuth();
	const navigate = useNavigate();
	
	// Form state
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	
	// Validation from hook
	const { validationError, clearError: clearValidationError, validateEmail } = useFormValidation();

	// ============================================================================
	// FORM SUBMISSION
	// ============================================================================
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		clearError();
		clearValidationError();
		
		if (!email || !password) {
			return;
		}
		
		if (!validateEmail(email)) {
			return;
		}
		
		try {
			const loggedInUser = await login(email, password);
			const dashboardPath = getDashboardPath(loggedInUser.role);
			
			console.log(`✅ Login successful!`);
			console.log(`   User: ${loggedInUser.name}`);
			console.log(`   Role: ${loggedInUser.role}`);
			console.log(`   Redirecting to: ${dashboardPath}`);
			
			navigate(dashboardPath);
			
		} catch (err) {
			console.error("❌ Login failed:", err);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-lg p-6 md:p-8 flex flex-col items-center justify-center">
				{/* Main header */}
				<div className="text-center mb-6 md:mb-8">
					<h3 className="text-2xl md:text-3xl font-medium">Sign In</h3>
				</div>

				{/* Error Messages */}
				{(error || validationError) && (
				<div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
					{validationError || error}
				</div>
			)}
			<form className="space-y-5 md:space-y-6 w-full" onSubmit={handleSubmit}>
				{/* Email */}
				<FormInput
					id="email"
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email address"
					required
				/>

				{/* Password */}
				<FormPasswordInput
					id="password"
					label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
					required
				/>

				{/* Remember me & Forgot password */}
				<div className="flex items-center justify-between pt-1 md:pt-2">
					<div className="flex items-center gap-2">
						<input
							id="remember-me"
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="h-4 w-4 accent-black cursor-pointer"
						/>
						<label htmlFor="remember-me" className="text-xs md:text-sm cursor-pointer">
							Remember me
						</label>
					</div>
					<Link to="/forgot-password" className="text-xs md:text-sm font-medium text-primary hover:underline underline">
						Forgot password?
					</Link>
				</div>

				{/* Sign In Button */}
				<button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-full h-11 md:h-12 text-sm md:text-base font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
					style={{
						backgroundColor:
							!isLoading ? "#000" : "#a3a3a3",
					}}
				>
					{isLoading ? "Signing in..." : "Sign in"}
				</button>

				{/* Sign Up Link */}
				<p className="text-center text-xs md:text-sm">
					Don't have an account?{" "}
					<Link to="/signup" className="font-medium text-primary hover:underline underline">
						Create an account
					</Link>
				</p>
				</form>
		</div>
		</div>
	);
}
