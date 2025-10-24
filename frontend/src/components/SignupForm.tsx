"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";


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

function Bullet({
  ok,
  first,
  children,
}: {
  ok: boolean;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`inline-flex items-center text-[13px] md:text-sm leading-5 ${
        ok ? "text-green-600 font-medium" : "text-neutral-700"
      }`}
    >
      {!first && <span aria-hidden className="mx-1.5 md:mx-2 select-none">•</span>}
      <span className="whitespace-nowrap">{children}</span>
    </li>
  );
}

export default function SignupForm() {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false); // ← checkbox state

  const checks = usePasswordChecks(form.password);
  const allPwOk = checks.len && checks.upper && checks.lower && checks.digit && checks.special;

  const canSubmit =
    form.firstName.trim() && form.lastName.trim() && emailOk(form.email) && allPwOk;

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // you can use marketingOptIn here as well
    alert(`Account created (demo). Marketing: ${marketingOptIn ? "yes" : "no"}`);
	
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[60%_40%]">
      {/* Left: centered content */}
      <section className="bg-white grid place-items-center px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-xl md:max-w-[42rem]">
          {/* Your logo stays */}
          <div className="mb-10 mt-[5px]">
            <img
              src="../src/assets/LCS_Icon_Black_SVG.svg"
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
          </div>

          <h1 className="text-4xl font-semibold tracking-tight mb-8">Sign Up</h1>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={onChange("firstName")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                autoComplete="given-name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={onChange("lastName")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={onChange("email")}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                autoComplete="email"
              />
              {form.email && !emailOk(form.email) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid email.</p>
              )}
            </div>

            {/* Password */}
			<div>
			{/* Label + show/hide (lucide) */}
			<div className="mb-2 flex items-center justify-between">
				<label htmlFor="password" className="text-sm font-medium">
				Password
				</label>
				<button
				type="button"
				onClick={() => setShowPw(!showPw)}
				className="text-sm flex items-center gap-1 text-neutral-600 hover:text-neutral-800"
				>
				{showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
				{showPw ? "Hide" : "Show"}
				</button>
			</div>

			<input
				id="password"
				type={showPw ? "text" : "password"}
				value={form.password}
				onChange={onChange("password")}
				className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
				autoComplete="new-password"
			/>

			{/*Always-visible password rules */}
			<div className="mt-3 min-h-[52px]">
				<ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] md:text-sm leading-5">
				<Bullet ok={checks.len} first>
					Use 8 or more characters
				</Bullet>
				<Bullet ok={checks.upper}>One Uppercase character</Bullet>
				<Bullet ok={checks.lower}>One lowercase character</Bullet>
				<Bullet ok={checks.special}>One special character</Bullet>
				<Bullet ok={checks.digit}>One number</Bullet>
				</ul>
			</div>
			</div>

           {/* Marketing opt-in checkbox */}
			<div className="flex items-start gap-2">
			<input
				type="checkbox"
				id="marketing"
				checked={marketingOptIn}
				onChange={(e) => setMarketingOptIn(e.target.checked)}
				className="mt-1 h-4 w-4 accent-black cursor-pointer"
			/>
			<label htmlFor="marketing" className="text-sm cursor-pointer">
				I want to receive emails about the product, feature updates, events, and
				marketing promotions.
			</label>
			</div>

            {/* Terms (keep your style) */}
            <p className="text-sm text-neutral-700">
              By creating an account, you agree to the{" "}
              <a href="#" className="underline text-black">Terms of use</a> and{" "}
              <a href="#" className="underline text-black">Privacy Policy</a>.
            </p>

            {/* Your button style + bottom spacing */}
            <div className="pt-2 pb-16">
              {canSubmit ? (
  <Link
    to="/signin"
    className="mx-auto flex w-64 items-center justify-center rounded-full px-6 py-4 text-base font-semibold text-white bg-black hover:opacity-90"
  >
    Create an account
  </Link>
) : (
  <button
    type="submit"
    disabled
    className="mx-auto flex w-64 items-center justify-center rounded-full px-6 py-4 text-base font-semibold text-white bg-neutral-400 cursor-not-allowed"
  >
    Create an account
  </button>
)}

              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/signin" className="font-semibold text-black underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Right column: gray (auto full height via grid) */}
      <aside className="hidden md:block bg-neutral-200" />
    </div>
  );
}
