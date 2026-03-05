"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-wider text-cream">
          Check your email
        </h1>
        <p className="text-sm text-taupe">
          We sent a confirmation link to <strong className="text-cream">{email}</strong>.
          Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-cream underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold tracking-wider text-cream">
        Create your account
      </h1>
      <p className="mb-8 text-center text-sm text-taupe">
        Start connecting with your persona
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-xl border border-taupe/20 bg-surface-light px-4 py-3 text-sm text-cream placeholder:text-taupe/40 focus:border-burgundy focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl border border-taupe/20 bg-surface-light px-4 py-3 text-sm text-cream placeholder:text-taupe/40 focus:border-burgundy focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-xl border border-taupe/20 bg-surface-light px-4 py-3 text-sm text-cream placeholder:text-taupe/40 focus:border-burgundy focus:outline-none"
        />

        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-burgundy py-3 text-sm font-bold tracking-wider text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-taupe">
        Already have an account?{" "}
        <Link href="/login" className="text-cream underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
