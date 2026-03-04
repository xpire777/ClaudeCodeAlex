"use client";

import { useEffect, useRef, useState } from "react";

const mockMessages = [
  { from: "persona", text: "good morning! just grabbed my coffee ☕", time: "9:12 AM" },
  { from: "user", text: "you're up early", time: "9:13 AM" },
  { from: "persona", text: "couldn't sleep lol. what are you up to today?", time: "9:13 AM" },
  { from: "user", text: "nothing yet, just woke up", time: "9:15 AM" },
  { from: "persona", text: "perfect. i just sent you a pic from the cafe 📸", time: "9:16 AM" },
];

export default function Teaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center bg-dark px-6 py-24"
    >
      <h2
        className={`mb-4 text-2xl font-bold tracking-[0.12em] text-cream transition-all duration-700 sm:text-3xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        A Glimpse Inside
      </h2>
      <p
        className={`mb-12 text-taupe transition-all duration-700 delay-100 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        This is what your mornings could look like.
      </p>

      {/* Phone mockup */}
      <div
        className={`transition-all duration-1000 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="relative mx-auto w-[280px] rounded-[40px] border-[3px] border-taupe/20 bg-[#1a1815] p-3 shadow-2xl sm:w-[320px]">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1a1815]" />

          {/* Screen */}
          <div className="overflow-hidden rounded-[32px] bg-[#252220]">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pb-1 pt-6">
              <span className="text-[10px] text-taupe/40">9:16 AM</span>
              <div className="flex gap-1">
                <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
                <div className="h-1.5 w-1.5 rounded-sm bg-taupe/30" />
                <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
              </div>
            </div>

            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-taupe/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy/80">
                <span className="text-xs font-bold text-cream">E</span>
              </div>
              <div>
                <p className="text-sm font-bold text-cream">Eva</p>
                <p className="text-[10px] text-taupe/50">Online now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-2.5 px-4 py-4">
              {mockMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.from === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
                      msg.from === "user"
                        ? "rounded-br-md bg-burgundy/80 text-cream"
                        : "rounded-bl-md bg-taupe/15 text-cream/90"
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="mt-0.5 text-[9px] text-taupe/30">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 border-t border-taupe/10 px-4 py-3">
              <div className="flex-1 rounded-full bg-taupe/10 px-4 py-2">
                <span className="text-[11px] text-taupe/30">Message...</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cream">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
