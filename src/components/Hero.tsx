"use client";

import { useState } from "react";
import Image from "next/image";

const desktopItems = [
  {
    type: "chat",
    text: "just got back from the gym 💪",
    position: "left-[5%] top-[18%]",
    fadeDelay: "animate-delay-200",
    float: "animate-float-slow",
  },
  {
    type: "photo",
    persona: "Kai",
    image: "/logos/kai.png",
    position: "right-[6%] top-[14%]",
    fadeDelay: "animate-delay-300",
    float: "animate-float",
  },
  {
    type: "chat",
    text: "good morning 🤍",
    position: "left-[8%] top-[45%]",
    fadeDelay: "animate-delay-100",
    float: "animate-float",
  },
  {
    type: "chat",
    text: "you free tonight?",
    position: "right-[8%] top-[42%]",
    fadeDelay: "animate-delay-400",
    float: "animate-float-slower",
  },
  {
    type: "photo",
    persona: "Sienna",
    image: "/logos/sienna.png",
    position: "left-[12%] bottom-[22%]",
    fadeDelay: "animate-delay-300",
    float: "animate-float-slower",
  },
  {
    type: "chat",
    text: "thinking about you ✨",
    position: "right-[5%] bottom-[25%]",
    fadeDelay: "animate-delay-200",
    float: "animate-float-slow",
  },
];

const mobileItems = [
  {
    type: "chat",
    text: "good morning 🤍",
    position: "left-[4%] top-[8%]",
    fadeDelay: "animate-delay-100",
    float: "animate-float",
  },
  {
    type: "chat",
    text: "you free tonight?",
    position: "right-[4%] top-[12%]",
    fadeDelay: "animate-delay-300",
    float: "animate-float-slower",
  },
  {
    type: "chat",
    text: "thinking about you ✨",
    position: "left-[6%] bottom-[8%]",
    fadeDelay: "animate-delay-200",
    float: "animate-float-slow",
  },
  {
    type: "photo",
    persona: "Sienna",
    image: "/logos/sienna.png",
    position: "right-[2%] bottom-[10%]",
    fadeDelay: "animate-delay-400",
    float: "animate-float-slower",
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
      {/* Floating chat bubbles — mobile */}
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        {mobileItems.map((item, i) => (
          <div
            key={i}
            className={`absolute ${item.position} opacity-0 animate-fade-in-up ${item.fadeDelay}`}
          >
            <div className={item.float}>
            {item.type === "chat" ? (
              <div className="rounded-2xl rounded-bl-md bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="whitespace-nowrap text-[10px] text-dark/60">
                  {item.text}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/60 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                  <Image
                    src={item.image!}
                    alt="AI companion persona photo"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-dark/50">{item.persona} sent a photo</p>
                  <p className="text-[8px] text-taupe">just now</p>
                </div>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating chat bubbles — desktop */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {desktopItems.map((item, i) => (
          <div
            key={i}
            className={`absolute ${item.position} opacity-0 animate-fade-in-up ${item.fadeDelay}`}
          >
            <div className={item.float}>
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
                    alt="AI companion persona photo"
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
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <h1 className="mb-6 text-6xl font-bold tracking-[0.3em] text-dark opacity-0 animate-fade-in-up sm:text-7xl">
          CABN
        </h1>

        <p className="mb-4 whitespace-nowrap text-lg tracking-[0.2em] text-dark opacity-0 animate-fade-in-up animate-delay-100 sm:text-xl">
          Connection, reimagined.
        </p>

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
