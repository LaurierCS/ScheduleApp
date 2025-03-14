"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function SigninForm() {
	const [email, setEmail] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Values entered: ", email, password, rememberMe);
		// Proceed with form submission
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-1 items-center justify-center w-full mt-20">
				<div className="w-full p-4 md:p-8 lg:p-8 flex flex-col items-center justify-center">
					<div className="max-w-md w-full mx-auto">
						<h3 className="text-2xl font-medium mb-8">Sign In</h3>

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
                                {/* TODO: change url to actual forget password page */}
								<Link to="#" className="text-sm font-medium">
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
                                className="w-full rounded-full hover:bg-opacity-90">
								Sign in
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
