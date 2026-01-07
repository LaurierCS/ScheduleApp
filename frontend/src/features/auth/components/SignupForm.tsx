"use client";

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/utils/navigation";


type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const usePasswordChecks = (password: string) =>
  useMemo(
    () => ({
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[^\w\s]/.test(password),
    }),
    [password]
  );

export default function SignupForm() {
  // ============================================================================
  // HOOKS & AUTH
  // ============================================================================
  
  // Get auth functions and state from AuthContext
  const { register, isLoading, error, clearError } = useAuth();
  
  // Navigation hook to redirect after registration
  const navigate = useNavigate();
  
  // ============================================================================
  // FORM STATE
  // ============================================================================
  
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);
  
  // Local validation error
  const [validationError, setValidationError] = useState("");

  // ============================================================================
  // PASSWORD VALIDATION
  // ============================================================================
  
  const checks = usePasswordChecks(form.password);
  const allPwOk = checks.len && checks.upper && checks.lower && checks.digit && checks.special;

  const canSubmit =
    form.firstName.trim() && form.lastName.trim() && emailOk(form.email) && allPwOk;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    setValidationError("");
    
    // Check if form is valid
    if (!canSubmit) {
      setValidationError("Please fill in all required fields correctly");
      return;
    }
    
    try {
      // Combine first and last name for backend
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      
      // Call the register function from AuthContext
      // It returns the user data directly so we can navigate immediately
      const newUser = await register(fullName, form.email, form.password);
      
      // Registration was successful! Navigate based on user role
      const dashboardPath = getDashboardPath(newUser.role);
      
      console.log(`✅ Registration successful!`);
      console.log(`   User: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Redirecting to: ${dashboardPath}`);
      
      navigate(dashboardPath);
      
    } catch (err) {
      // Error is already stored in AuthContext
      // It will be displayed in the UI automatically
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
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="firstName" className="block text-sm md:text-base font-medium">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={onChange("firstName")}
              className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 border border-black"
              autoComplete="given-name"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="lastName" className="block text-sm md:text-base font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={onChange("lastName")}
              className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 border border-black"
              autoComplete="family-name"
              placeholder="Enter your last name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="email" className="block text-sm md:text-base font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 border border-black"
              autoComplete="email"
              placeholder="Enter your email address"
            />
            {form.email && !emailOk(form.email) && (
              <p className="mt-1 text-xs md:text-sm text-red-600">Please enter a valid email.</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="password" className="block text-sm md:text-base font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={onChange("password")}
                className="w-full rounded-md h-11 md:h-12 text-sm md:text-base px-4 pr-12 border border-black"
                autoComplete="new-password"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 border-none bg-transparent focus:outline-none"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            {/* Password requirements - validation bullets */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 md:mt-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    checks.len ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`text-xs md:text-sm ${
                    checks.len ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  Use 8 or more characters
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    checks.upper ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`text-xs md:text-sm ${
                    checks.upper ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  One Uppercase character
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    checks.lower ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    checks.lower ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  One lowercase character
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    checks.special ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`text-xs md:text-sm ${
                    checks.special ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  One special character
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    checks.digit ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={`text-xs md:text-sm ${
                    checks.digit ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  One number
                </span>
              </div>
            </div>
          </div>

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
