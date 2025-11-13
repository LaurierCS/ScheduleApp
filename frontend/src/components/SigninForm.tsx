"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-1 items-center justify-center w-full mt-20">
				<div className="w-full p-4 md:p-8 lg:p-8 flex flex-col items-center justify-center">
					<div className="max-w-md w-full mx-auto">
						<h3 className="text-2xl font-medium mb-8">Sign In</h3>

						{/* Error Messages */}
						{(error || validationError) && (
							<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
								{validationError || error}
							</div>
						)}

						<form className="space-y-6" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label htmlFor="email" className="block text-sm font-medium">
									Email
								</label>
								<Input
									id="email"
									type="email"
									className="w-full rounded-md"
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<label
										htmlFor="password"
										className="block text-sm font-medium">
										Password
									</label>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-sm flex items-center gap-1">
										{showPassword ? (
											<EyeOffIcon size={16} />
										) : (
											<EyeIcon size={16} />
										)}
										{showPassword ? "Hide" : "Show"}
									</button>
								</div>
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									className="w-full rounded-md"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Checkbox
										id="remember-me"
										checked={rememberMe}
										onCheckedChange={(checked) => setRememberMe(!!checked)}
										className="px-3"
									/>
									<label htmlFor="remember-me" className="text-sm">
										Remember me
									</label>
                                </div>
                                {/* Link to forgot password page */}
								<Link to="/forgot-password" className="text-sm font-medium">
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
								disabled={isLoading}
                                className="w-full rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
								{isLoading ? "Signing in..." : "Sign in"}
							</Button>

							<div className="text-center text-sm">
								Don't have an account?{" "}
								<Link to="/signup" className="font-medium">
									Create an account
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
