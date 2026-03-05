"use client";

import { useState } from "react";
import Image from "next/image";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-dark px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Image
            src="/logos/logo_wordmark.svg"
            alt="CABN"
            width={120}
            height={30}
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold tracking-wider text-cream">
          Staging Access
        </h1>
        <p className="mb-8 text-center text-sm text-taupe">
          Enter the password to continue
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
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
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
