"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDashboardPath } from "@/utils/navigation";
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
      const dashboardPath = getDashboardPath(newUser.role);
      
      console.log(`✅ Registration successful!`);
      console.log(`   User: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Redirecting to: ${dashboardPath}`);
      
      navigate(dashboardPath);
      
    } catch (err) {
      console.error("❌ Registration failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-6 md:p-8 flex flex-col items-center justify-center">
        {/* Main header */}
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-2xl md:text-3xl font-medium">Sign Up</h3>
        </div>

        {/* Error Messages */}
        {(error || validationError) && (
          <div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
            {validationError || error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5 md:space-y-6 w-full">
          {/* First Name */}
          <FormInput
            id="firstName"
            label="First Name"
            type="text"
            value={form.firstName}
            onChange={onChange("firstName")}
            autoComplete="given-name"
            placeholder="Enter your first name"
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
            placeholder="Enter your last name"
            required
          />

          {/* Email */}
          <FormInput
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            autoComplete="email"
            placeholder="Enter your email address"
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
            placeholder="Enter password"
            required
          />

          {/* Password requirements - validation bullets */}
          <PasswordRequirements 
            validation={passwordChecks}
            responsive={true}
          />

          {/* Marketing opt-in checkbox */}
          <div className="flex items-start gap-2 pt-1 md:pt-2">
            <input
              type="checkbox"
              id="marketing"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 accent-black cursor-pointer"
            />
            <label htmlFor="marketing" className="text-xs md:text-sm cursor-pointer">
              I want to receive emails about the product, feature updates, events, and
              marketing promotions.
            </label>
          </div>

          {/* Terms */}
          <p className="text-xs md:text-sm text-gray-600">
            By creating an account, you agree to the{" "}
            <a href="#" className="underline text-black font-medium">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="#" className="underline text-black font-medium">
              Privacy Policy
            </a>
            .
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full rounded-full h-11 md:h-12 text-sm md:text-base font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
            style={{
              backgroundColor:
                canSubmit && !isLoading ? "#000" : "#a3a3a3",
            }}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-xs md:text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="font-medium text-primary hover:underline underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
