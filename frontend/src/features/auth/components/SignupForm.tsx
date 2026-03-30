"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePasswordValidation, isPasswordValid } from "../hooks/usePasswordValidation";
import { useFormValidation } from "../hooks/useFormValidation";
import { FormInput } from "./ui/FormInput";
import { FormPasswordInput } from "./ui/FormPasswordInput";
import { PasswordRequirements } from "./ui/PasswordRequirements";
import { FormTextArea } from "./ui/FormTextArea";
import {
  clearTeamOnboarding,
  setTeamOnboarding,
  TeamChoice,
} from "../utils/onboardingStorage";

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

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);
  const [teamChoice, setTeamChoice] = useState<TeamChoice | null>(null);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");

  // Validation hooks
  const passwordChecks = usePasswordValidation(form.password);
  const {
    validationError,
    setValidationError,
    clearError: clearValidationError,
    validateEmail,
  } = useFormValidation();

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isPasswordOk = isPasswordValid(passwordChecks);
  const canContinue =
    form.firstName.trim() &&
    form.lastName.trim() &&
    validateEmail(form.email) &&
    isPasswordOk;

  const canSubmitTeam = (() => {
    if (!teamChoice) return false;
    if (teamChoice === "join") return !!inviteCode.trim();
    return !!teamName.trim();
  })();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleContinue = () => {
    clearError();
    clearValidationError();

    if (!canContinue) {
      setValidationError("Please fill in all required fields correctly");
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    clearValidationError();
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    clearValidationError();

    if (step === 1) {
      handleContinue();
      return;
    }

    if (!teamChoice) {
      setValidationError("Please choose to join or create a team");
      return;
    }

    if (teamChoice === "join" && !inviteCode.trim()) {
      setValidationError("Invite code is required to join a team");
      return;
    }

    if (teamChoice === "create" && !teamName.trim()) {
      setValidationError("Team name is required");
      return;
    }

    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const inviteCodeToSend = teamChoice === "join" ? inviteCode.trim() : undefined;
      const newUser = await register(
        fullName,
        form.email,
        form.password,
        inviteCodeToSend
      );

      console.log(`✅ Registration successful!`);
      console.log(`   User: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Email verification required - redirecting to /2fa`);

      if (teamChoice === "create") {
        setTeamOnboarding({
          choice: "create",
          team: {
            name: teamName.trim(),
            description: teamDescription.trim() || undefined,
          },
        });
      } else {
        clearTeamOnboarding();
      }

      // Store email and role in sessionStorage for the 2FA/verification page
      sessionStorage.setItem("signupEmail", form.email);
      sessionStorage.setItem("verificationType", "signup");
      sessionStorage.setItem("signupUserRole", newUser.role);

      console.log(`📋 Stored in sessionStorage:`);
      console.log(`   signupEmail: ${form.email}`);
      console.log(`   verificationType: signup`);
      console.log(`   signupUserRole: ${newUser.role}`);

      navigate("/2fa");
    } catch (err) {
      console.error("❌ Registration failed:", err);
    }
  };

  const isStepOne = step === 1;

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">
              {isStepOne ? "Create your account" : "Set up your team"}
            </p>
            <p className="text-xs uppercase tracking-wide text-gray-400 mt-3">
              Step {step} of 2
            </p>
          </div>

          {/* Error Messages */}
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {validationError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isStepOne ? (
              <>
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
                  error={
                    form.email && !validateEmail(form.email)
                      ? "Please enter a valid email."
                      : ""
                  }
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
                <PasswordRequirements validation={passwordChecks} responsive={true} />

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

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-base mt-6"
                >
                  {isLoading ? "Checking details..." : "Continue"}
                </button>
              </>
            ) : (
              <>
                {/* Team Choice */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Choose how you want to set up your team.</p>
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => setTeamChoice("join")}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        teamChoice === "join"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="font-semibold">Join a team</div>
                      <div className="text-sm text-gray-500">
                        Use an invite code from your admin
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamChoice("create")}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        teamChoice === "create"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="font-semibold">Create a team</div>
                      <div className="text-sm text-gray-500">
                        Set up a new team and become the admin
                      </div>
                    </button>
                  </div>
                </div>

                {/* Join Team Fields */}
                {teamChoice === "join" && (
                  <FormInput
                    id="inviteCode"
                    label="Invite Code"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter your 6-digit code"
                    required
                  />
                )}

                {/* Create Team Fields */}
                {teamChoice === "create" && (
                  <>
                    <FormInput
                      id="teamName"
                      label="Team Name"
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Acme Recruiting"
                      required
                    />
                    <FormTextArea
                      id="teamDescription"
                      label="Team Description (optional)"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Tell us what this team focuses on"
                    />
                  </>
                )}

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmitTeam || isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-base"
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </button>
                </div>
              </>
            )}

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
