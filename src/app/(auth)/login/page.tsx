"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/discover";
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold tracking-wider text-cream">
        Welcome back
      </h1>
      <p className="mb-8 text-center text-sm text-taupe">
        Sign in to continue
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-taupe">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-cream underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </>
  );
}
