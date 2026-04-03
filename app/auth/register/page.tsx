// 4. app/auth/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  orgName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  orgName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    orgName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (!form.name.trim()) {
      next.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (!form.orgName.trim()) {
      next.orgName = "Organization name is required";
    } else if (form.orgName.trim().length < 2) {
      next.orgName = "Organization name must be at least 2 characters";
    }

    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      next.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      next.password = "Password must contain at least one number";
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          orgName: form.orgName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          general: data?.message ?? "Registration failed. Please try again.",
        });
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Registration succeeded but auto-login failed — send to login
        router.push("/auth/login?registered=true");
      }
    } catch {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setErrors({
        general: "Failed to sign in with Google. Please try again.",
      });
      setIsGoogleLoading(false);
    }
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full bg-slate-800 border ${
      errors[field]
        ? "border-red-500/60 focus:border-red-500"
        : "border-slate-700 focus:border-violet-500"
    } text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors duration-150`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Start your free trial — no credit card required
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/40">
          {errors.general && (
            <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <svg
                className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <svg
                className="w-4 h-4 animate-spin text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isGoogleLoading ? "Connecting…" : "Sign up with Google"}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500">
                or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Jane Smith"
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="jane@company.com"
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Org Name */}
            <div>
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Organization name
              </label>
              <input
                id="orgName"
                type="text"
                autoComplete="organization"
                value={form.orgName}
                onChange={(e) => setField("orgName", e.target.value)}
                placeholder="Acme Corp"
                className={inputClass("orgName")}
              />
              {errors.orgName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.orgName}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={inputClass("password")}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className={inputClass("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500 pt-1">
              By creating an account you agree to our{" "}
              <Link
                href="/terms"
                className="text-violet-400 hover:text-violet-300"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-violet-400 hover:text-violet-300"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
