"use client";

import { useState } from "react";

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list. We'll be in touch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <section className="flex flex-col items-center px-6 py-14" style={{ background: "linear-gradient(180deg, var(--color-cream) 0%, #e8ddd4 50%, #dfd0c5 100%)" }}>
      <h2 className="mb-4 text-2xl font-bold tracking-[0.12em] text-dark sm:text-3xl">
        Join the Waitlist Now
      </h2>
      <p className="mb-8 text-taupe">
        Be the first to experience CABN.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Enter your email"
          className="flex-1 rounded-lg border border-taupe/30 bg-white px-5 py-3.5 text-dark placeholder:text-taupe/60 focus:border-burgundy focus:outline-none focus:ring-1 focus:ring-burgundy"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-burgundy px-8 py-3.5 font-bold tracking-wider text-cream transition-all hover:bg-burgundy/90 disabled:opacity-60"
        >
          {status === "loading" ? "Joining..." : "Join the Waitlist"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-4 text-sm text-burgundy animate-fade-in-up">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-600 animate-fade-in-up">{message}</p>
      )}
    </section>
  );
}
