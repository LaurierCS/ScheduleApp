"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePasswordValidation, isPasswordValid } from "../hooks/usePasswordValidation";
import { useFormValidation } from "../hooks/useFormValidation";
import { FormInput } from "./ui/FormInput";
import { FormPasswordInput } from "./ui/FormPasswordInput";
import { PasswordRequirements } from "./ui/PasswordRequirements";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function SignupForm() {
  // ============================================================================
  // HOOKS & AUTH
  // ============================================================================
  
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // ============================================================================
  // FORM STATE
  // ============================================================================
  
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);
  
  // Validation hooks
  const passwordChecks = usePasswordValidation(form.password);
  const { validationError, setValidationError, clearError: clearValidationError, validateEmail } = useFormValidation();

  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  
  const isPasswordOk = isPasswordValid(passwordChecks);
  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    validateEmail(form.email) &&
    isPasswordOk;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearError();
    clearValidationError();
    
    if (!canSubmit) {
      setValidationError("Please fill in all required fields correctly");
      return;
    }
    
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const newUser = await register(fullName, form.email, form.password);
      
      console.log(`✅ Registration successful!`);
      console.log(`   User: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Email verification required - redirecting to /2fa`);
      
      // Store email and role in sessionStorage for the 2FA/verification page
      sessionStorage.setItem('signupEmail', form.email);
      sessionStorage.setItem('verificationType', 'signup');
      sessionStorage.setItem('signupUserRole', newUser.role);
      
      console.log(`📋 Stored in sessionStorage:`);
      console.log(`   signupEmail: ${form.email}`);
      console.log(`   verificationType: signup`);
      console.log(`   signupUserRole: ${newUser.role}`);
      
      navigate('/2fa');
      
    } catch (err) {
      console.error("❌ Registration failed:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">Join us to get started</p>
          </div>

          {/* Error Messages */}
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {validationError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* First Name */}
            <FormInput
              id="firstName"
              label="First Name"
              type="text"
              value={form.firstName}
              onChange={onChange("firstName")}
              autoComplete="given-name"
              placeholder="John"
              required
            />

            {/* Last Name */}
            <FormInput
              id="lastName"
              label="Last Name"
              type="text"
              value={form.lastName}
              onChange={onChange("lastName")}
              autoComplete="family-name"
              placeholder="Doe"
              required
            />

            {/* Email */}
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              autoComplete="email"
              placeholder="john@example.com"
              error={form.email && !validateEmail(form.email) ? "Please enter a valid email." : ""}
              required
            />

            {/* Password */}
            <FormPasswordInput
              id="password"
              label="Password"
              value={form.password}
              onChange={onChange("password")}
              autoComplete="new-password"
              placeholder="Create a strong password"
              required
            />

            {/* Password Requirements */}
            <PasswordRequirements 
              validation={passwordChecks}
              responsive={true}
            />

            {/* Marketing Opt-in */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="h-4 w-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="marketing" className="text-sm text-gray-600 cursor-pointer">
                  Send me updates about new features and product news
                </label>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-base mt-6"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 mt-6 pb-8">
              Already have an account?{" "}
              <Link to="/signin" className="text-blue-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
