"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function SignupForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [password, setPassword] = useState("");
	const [passwordRequirements, setPasswordRequirements] = useState({
		minLength: false,
		hasUppercase: false,
		hasLowercase: false,
		hasSpecial: false,
		hasNumber: false,
	});

	// Check password requirements whenever the password changes
	useEffect(() => {
		setPasswordRequirements({
			minLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasSpecial: /[^A-Za-z0-9]/.test(password),
			hasNumber: /[0-9]/.test(password),
		});
	}, [password]);

	return (
		<div className="flex flex-col">
			<div className="flex flex-1">
				<div className="w-full p-4 md:p-8 lg:p-8 flex flex-col">
					<div className="max-w-md w-full mx-auto">
						<h3 className="text-2xl font-medium mb-8">Sign Up</h3>

						<form className="space-y-6">
							<div className="space-y-2">
								<label htmlFor="email" className="block text-sm font-medium">
									Email
								</label>
								<Input id="email" type="email" className="w-full rounded-md" />
							</div>

							<div className="space-y-2">
								<label htmlFor="username" className="block text-sm font-medium">
									Username
								</label>
								<Input
									id="username"
									type="text"
									className="w-full rounded-md"
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

							<div className="space-y-2">
								<ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
									<li className="flex items-center gap-1">
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												passwordRequirements.minLength
													? "bg-green-500"
													: "bg-gray-400"
											}`}></span>
										<span
											className={
												passwordRequirements.minLength ? "text-green-500" : ""
											}>
											Use 8 or more characters
										</span>
									</li>
									<li className="flex items-center gap-1">
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												passwordRequirements.hasUppercase
													? "bg-green-500"
													: "bg-gray-400"
											}`}></span>
										<span
											className={
												passwordRequirements.hasUppercase
													? "text-green-500"
													: ""
											}>
											One Uppercase character
										</span>
									</li>
									<li className="flex items-center gap-1">
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												passwordRequirements.hasLowercase
													? "bg-green-500"
													: "bg-gray-400"
											}`}></span>
										<span
											className={
												passwordRequirements.hasLowercase
													? "text-green-500"
													: ""
											}>
											One lowercase character
										</span>
									</li>
									<li className="flex items-center gap-1">
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												passwordRequirements.hasSpecial
													? "bg-green-500"
													: "bg-gray-400"
											}`}></span>
										<span
											className={
												passwordRequirements.hasSpecial ? "text-green-500" : ""
											}>
											One special character
										</span>
									</li>
									<li className="flex items-center gap-1">
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												passwordRequirements.hasNumber
													? "bg-green-500"
													: "bg-gray-400"
											}`}></span>
										<span
											className={
												passwordRequirements.hasNumber ? "text-green-500" : ""
											}>
											One number
										</span>
									</li>
								</ul>
							</div>

							<div className="flex items-start gap-2">
								<Checkbox
									id="marketing"
									className="mt-2 px-3"
								/>
								<label htmlFor="marketing" className="text-sm">
									I want to receive emails about the product, feature updates,
									events, and marketing promotions.
								</label>
							</div>

							<div className="text-sm">
								<p>
									By creating an account, you agree to the{" "}
									<Link to="#" className="underline">
										Terms of use
									</Link>{" "}
									and{" "}
									<Link to="#" className="underline">
										Privacy Policy
									</Link>
									.
								</p>
							</div>

							<Button className="w-full rounded-full hover:bg-opacity-90">
								Create an account
							</Button>

							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link to="/signin" className="font-medium">
									Log in
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
