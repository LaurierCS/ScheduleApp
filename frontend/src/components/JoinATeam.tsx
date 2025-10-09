"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinATeam() {
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Handle email validation
  const validateEmail = (email: string) =>
    /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(email);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ERROR: Email is not valid
    if (!validateEmail(email)) {
      setShowErrors(true);
      setSuccess("");
      return;
    }

    setShowErrors(false);
    setLoading(true);

    // Fetching Invites Simulation
    setTimeout(() => {
      setLoading(false);
      setSuccess("Invitation received successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Top header bar */}
      <header className="w-full h-12 px-4 md:px-7 bg-gray-100 flex items-center border-b border-gray-200">
        <span className="text-gray-400 font-semibold text-base">
          Join a Team
        </span>
      </header>

      {/* Main split layout */}
      <main className="w-full flex flex-1 min-h-0">
        {/* Left: Form Section */}
        <section className="flex flex-col items-center flex-[5] bg-white min-h-full">
          {/* Logo */}
          <div className="flex w-full max-w-xl mx-auto px-4 md:px-0 pt-6">
            <span className="text-3xl font-bold tracking-tight">Logo</span>
          </div>
          <div className="w-full max-w-xl mx-auto flex flex-col justify-center flex-1">
            {/* Title and Instructions */}
            <h2 className="text-xl font-medium mb-2 text-center">
              Please enter your email!
            </h2>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-xs mx-auto">
              Your club, leader, or organizer should have invited you to a team
              by sending an invite link to your email. Either click the link
              through your email to join or enter it below to see your
              invitations.
            </p>

            <form
              className="w-full flex flex-col gap-5 px-4 md:px-0"
              onSubmit={handleSubmit}
            >
              {/* Email input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-gray-300 focus:border-black focus:ring-0 px-4 py-2"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (showErrors) setShowErrors(false);
                    if (success) setSuccess("");
                  }}
                  autoComplete="email"
                  disabled={loading}
                />
                {/* ERROR: Invalid Email */}
                {showErrors && (
                  <span className="text-xs text-red-500 mt-2 block">
                    Please enter a valid email.
                  </span>
                )}
                {/* SUCCESS: Joined A Team */}
                {success && (
                  <span className="text-xs text-green-600 mt-2 block">
                    {success}
                  </span>
                )}
              </div>

              {/* Go Back link */}
              <div className="mt-2">
                {/* TODO: Navigate to the Create or Join Team selection screen */}
                <Link
                  to="/home"
                  className="underline text-gray-700 text-sm hover:text-black"
                >
                  Go Back
                </Link>
              </div>

              {/* Join Team Button */}
              <Button
                type="submit"
                className="w-1/3 mx-auto rounded-full h-11 bg-black text-white text-base font-semibold mt-6 hover:bg-gray-900"
                disabled={loading}
              >
                {loading ? "Loading..." : "Join Team"}
              </Button>
            </form>
          </div>
        </section>

        {/* Right: Spacer/Background */}
        <section className="hidden md:block flex-[3] bg-gray-300 min-h-full" />
      </main>
    </div>
  );
}
