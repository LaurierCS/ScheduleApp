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
		<div className="flex flex-col min-h-screen pt-20">
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="mb-8 text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
						<p className="text-gray-600">Welcome back</p>
					</div>

					{/* Error Messages */}
					{(error || validationError) && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
							{validationError || error}
						</div>
					)}

					<form className="space-y-5" onSubmit={handleSubmit}>
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
					<div className="flex items-center justify-between pt-2">
						<div className="flex items-center gap-2">
							<input
								id="remember-me"
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="h-4 w-4 accent-black cursor-pointer"
							/>
							<label htmlFor="remember-me" className="text-sm cursor-pointer">
								Remember me
							</label>
						</div>
						<Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
							Forgot password?
						</Link>
					</div>

					{/* Sign In Button */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-base mt-6"
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</button>

					{/* Sign Up Link */}
					<p className="text-center text-sm text-gray-600 mt-6 pb-8">
						Don't have an account?{" "}
						<Link to="/signup" className="text-blue-600 hover:underline font-medium">
							Create an account
						</Link>
					</p>
				</form>
			</div>
		</div>
	</div>
	);
}
