"use client";

import { useState } from "react";
import Image from "next/image";

const floatingItems = [
  {
    type: "chat",
    text: "just got back from the gym 💪",
    className: "left-[5%] top-[18%] animate-float-slow opacity-0 animate-fade-in-up animate-delay-200",
  },
  {
    type: "photo",
    persona: "Kai",
    image: "/logos/kai.png",
    className: "right-[6%] top-[14%] animate-float opacity-0 animate-fade-in-up animate-delay-300",
  },
  {
    type: "chat",
    text: "good morning 🤍",
    className: "left-[8%] top-[45%] animate-float opacity-0 animate-fade-in-up animate-delay-100",
  },
  {
    type: "chat",
    text: "you free tonight?",
    className: "right-[8%] top-[42%] animate-float-slower opacity-0 animate-fade-in-up animate-delay-400",
  },
  {
    type: "photo",
    persona: "Sienna",
    image: "/logos/sienna.png",
    className: "left-[12%] bottom-[22%] animate-float-slower opacity-0 animate-fade-in-up animate-delay-300",
  },
  {
    type: "chat",
    text: "thinking about you ✨",
    className: "right-[5%] bottom-[25%] animate-float-slow opacity-0 animate-fade-in-up animate-delay-200",
  },
];

export default function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Floating chat bubbles and photo messages */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {floatingItems.map((item, i) => (
          <div
            key={i}
            className={`absolute ${item.className}`}
          >
            {item.type === "chat" ? (
              <div className="rounded-2xl rounded-bl-md bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <p className="whitespace-nowrap text-xs text-dark/70">
                  {item.text}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <Image
                    src={item.image!}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-dark/50">{item.persona} sent a photo</p>
                  <p className="text-[9px] text-taupe">just now</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <Image
          src="/logos/logo_wordmark.svg"
          alt="CABN"
          width={280}
          height={68}
          priority
          className="mb-12 opacity-0 animate-fade-in-up"
        />

        <h1 className="mb-4 whitespace-nowrap text-3xl font-bold tracking-[0.15em] text-dark opacity-0 animate-fade-in-up animate-delay-100 sm:text-4xl">
          Connection, reimagined.
        </h1>

        <p className="mb-10 max-w-md text-lg leading-relaxed text-taupe opacity-0 animate-fade-in-up animate-delay-200">
          A new kind of connection is coming. Curated, personal, always there
          when you need them.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-3 opacity-0 animate-fade-in-up animate-delay-300 sm:flex-row"
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
          <p className="mt-4 text-sm text-burgundy animate-fade-in-up">
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-600 animate-fade-in-up">
            {message}
          </p>
        )}

        <p className="mt-6 text-sm tracking-wide text-taupe opacity-0 animate-fade-in-up animate-delay-400">
          Be the first to know when we launch.
        </p>
      </div>
    </section>
  );
}
