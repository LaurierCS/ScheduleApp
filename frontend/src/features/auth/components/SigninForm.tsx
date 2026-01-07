"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/utils/navigation";

export default function SigninForm() {
	// ============================================================================
	// HOOKS & STATE
	// ============================================================================
	
	// Get auth functions and state from AuthContext
	const { login, isLoading, error, clearError } = useAuth();
	
	// Navigation hook to redirect after login
	const navigate = useNavigate();
	
	// Form state
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	
	// Local validation errors
	const [validationError, setValidationError] = useState("");

	// ============================================================================
	// FORM SUBMISSION
	// ============================================================================
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Clear any previous errors
		clearError();
		setValidationError("");
		
		// Basic validation
		if (!email || !password) {
			setValidationError("Please fill in all fields");
			return;
		}
		
		if (!email.includes("@")) {
			setValidationError("Please enter a valid email");
			return;
		}
		
		try {
			// Call the login function from AuthContext
			// It returns the user data directly so we can navigate immediately
			const loggedInUser = await login(email, password);
			
			// Login was successful! Navigate based on user role
			const dashboardPath = getDashboardPath(loggedInUser.role);
			
			console.log(`✅ Login successful!`);
			console.log(`   User: ${loggedInUser.name}`);
			console.log(`   Role: ${loggedInUser.role}`);
			console.log(`   Redirecting to: ${dashboardPath}`);
			
			navigate(dashboardPath);
			
		} catch (err) {
			// Error is already stored in AuthContext
			// It will be displayed in the UI automatically
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
			<form className="space-y-5 md:space-y-6 w-full" onSubmit={handleSubmit}>				{/* Email */}
				<div className="space-y-2 md:space-y-3">
					<label htmlFor="email" className="block text-sm md:text-base font-medium">
						Email
					</label>
					<input
						id="email"
						type="email"
						className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 border border-black"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email address"
					/>
				</div>

					{/* Password */}
				<div className="space-y-2 md:space-y-3">
					<label htmlFor="password" className="block text-sm md:text-base font-medium">
						Password
					</label>
					<div className="relative">
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 pr-12 border border-black"
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent focus:outline-none"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
						</button>
					</div>
				</div>

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
