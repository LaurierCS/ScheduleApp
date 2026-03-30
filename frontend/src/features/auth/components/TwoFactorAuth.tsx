import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import { verifyResetCode, verifyEmail, setTokens, getCurrentUser } from "../services/authApi";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "@/utils/navigation";
import { FormInput } from "./ui/FormInput";
import { createTeam } from "../services/teamApi";
import {
  clearTeamOnboarding,
  getTeamOnboarding,
  TeamOnboardingData,
} from "../utils/onboardingStorage";

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pendingTeam, setPendingTeam] = useState<TeamOnboardingData | null>(null);
  const [verificationType, setVerificationType] = useState<"password-reset" | "signup">(
    "password-reset"
  );

  // Load email and verification type from session storage on mount
  useEffect(() => {
    const storedVerificationType = sessionStorage.getItem("verificationType");
    const signupEmail = sessionStorage.getItem("signupEmail");
    const resetEmail = sessionStorage.getItem("resetEmail");

    if (storedVerificationType === "signup" && signupEmail) {
      setEmail(signupEmail);
      setVerificationType("signup");
      setPendingTeam(getTeamOnboarding());
    } else if (resetEmail) {
      setEmail(resetEmail);
      setVerificationType("password-reset");
    } else {
      // Redirect back to appropriate page if no email
      navigate(storedVerificationType === "signup" ? "/signup" : "/forgot-password");
    }
  }, [navigate]);

  // Handle code input change - only allow digits, max 6
  const handleCodeChange = (value: string) => {
    if (value.length > 6 || (value && !/^\d*$/.test(value))) return;
    setCode(value);
    setError("");
  };

  const finalizeSignup = async () => {
    const onboarding = pendingTeam ?? getTeamOnboarding();

    if (onboarding?.choice === "create" && onboarding.team?.name) {
      await createTeam({
        name: onboarding.team.name,
        description: onboarding.team.description,
      });
    }

    const userData = await getCurrentUser();
    const dashboardPath = getDashboardPath();

    sessionStorage.removeItem("signupEmail");
    sessionStorage.removeItem("verificationType");
    sessionStorage.removeItem("signupResponse");
    sessionStorage.removeItem("signupUserRole");
    clearTeamOnboarding();
    setPendingTeam(null);

    setSuccess(true);

    setTimeout(() => {
      setUser(userData);
      navigate(dashboardPath);
    }, 1500);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (verificationType === "signup" && !emailVerified) {
      if (!code || code.length !== 6) {
        setError("Please enter a 6-digit code");
        return;
      }
    }

    if (verificationType === "password-reset") {
      if (!code || code.length !== 6) {
        setError("Please enter a 6-digit code");
        return;
      }
    }

    setLoading(true);
    try {
      if (verificationType === "signup") {
        if (!emailVerified) {
          await verifyEmail({
            email,
            code,
          });

          setEmailVerified(true);

          const signupResponse = sessionStorage.getItem("signupResponse");
          if (signupResponse) {
            const response = JSON.parse(signupResponse);
            setTokens(response.accessToken, response.refreshToken);
            console.log("✅ Email verified successfully - tokens initialized");
            console.log("📧 Email:", email);
            console.log("🔑 Tokens set for user");
          }
        }

        try {
          await finalizeSignup();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to complete team setup. Please try again.";
          setError(message);
          return;
        }
      } else {
        // Handle password reset verification
        const response = await verifyResetCode({
          email,
          code,
        });

        // Store the reset token for password update
        if (response && response.data && response.data.resetToken) {
          setTokens(response.data.resetToken, "");
        }

        setSuccess(true);

        // Clear session email and navigate to password reset
        sessionStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/new-password");
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify code";
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if code is complete (6 digits) or already verified
  const isCodeComplete =
    verificationType === "signup"
      ? emailVerified || code.length === 6
      : code.length === 6;

  // Determine UI text based on verification type
  const headerText = "Verify Your Email";

  const instructionText =
    verificationType === "signup"
      ? "A 6-digit verification code has been sent to your email. Enter the code below to complete your registration."
      : "A 6-digit verification code has been sent to your email. Enter the code below to reset your password.";

  const backLink = verificationType === "signup" ? "/signup" : "/forgot-password";
  const hasPendingTeam = pendingTeam?.choice === "create";

  const buttonLabel = (() => {
    if (loading) return "Verifying...";
    if (success) return "Verified!";
    if (emailVerified && hasPendingTeam) return "Finish team setup";
    if (emailVerified) return "Continue";
    return "Verify Code";
  })();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
        {/* Main header */}
        <div className="text-center mb-4">
          <h3 className="text-3xl font-medium">{headerText}</h3>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-base text-gray-600 leading-relaxed">{instructionText}</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="border border-green-500 bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
            ✅ Code verified successfully! Redirecting...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm mb-6 w-full">
            {error}
          </div>
        )}

        <form className="space-y-8 w-full" onSubmit={handleSubmit}>
          {/* Email display (read-only) */}
          <FormInput
            id="email"
            label="Email"
            type="email"
            value={email}
            disabled
            placeholder="Your email address"
            required
          />

          {/* 2FA Code input */}
          <FormInput
            id="code"
            label="Verification Code"
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Enter 6-digit code"
            required
            disabled={success || emailVerified}
          />

          {/* Back link */}
          <div className="flex justify-start">
            <Link
              to={backLink}
              className="text-base font-medium text-primary hover:underline flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>

          {/* Verify button */}
          <Button
            type="submit"
            className="w-full rounded-full hover:bg-opacity-90 h-12 text-base"
            disabled={!isCodeComplete || loading || success}
          >
            {buttonLabel}
          </Button>
        </form>
      </div>
    </div>
  );
}
