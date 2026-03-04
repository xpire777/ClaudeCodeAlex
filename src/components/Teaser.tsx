"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const mockMessages = [
  { from: "persona", text: "good morning 🤍 just woke up stretching in bed lol", time: "9:12 AM" },
  { from: "user", text: "same honestly, still half asleep", time: "9:13 AM" },
  { from: "persona", text: "don't rush it. coffee first, everything else later", time: "9:13 AM" },
  { from: "user", text: "what are you doing today?", time: "9:15 AM" },
  { from: "persona", text: "yoga then brunch. sending you a pic later 📸", time: "9:16 AM" },
];

const photoMessages = [
  { from: "user", text: "can you send me a photo from the beach? 🌊", time: "2:44 PM" },
  { from: "persona", text: "omg yes!! just got here, the water is so blue today 😍", time: "2:54 PM" },
  { from: "persona", type: "photo" as const, time: "2:56 PM" },
  { from: "persona", text: "there you go! wish you were here", time: "3:01 PM" },
];

const personas = [
  { name: "Valentina", label: "The Glamorous Model", sub: "Aspirational, flirty", img: "/logos/valentina.png" },
  { name: "Kai", label: "The Adventurer", sub: "Spontaneous, warm", img: "/logos/kai.png" },
  { name: "Nadia", label: "The Spicy One", sub: "Bold, teasing", img: "/logos/nadia.png" },
  { name: "Maren", label: "The Creative", sub: "Dreamy, artistic", img: "/logos/maren.png" },
];

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-[260px] rounded-[40px] border-[3px] border-taupe/20 bg-[#1a1815] p-3 shadow-2xl sm:w-[280px] ${className}`}
    >
      <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1a1815]" />
      <div className="overflow-hidden rounded-[32px] bg-[#252220]">{children}</div>
    </div>
  );
}

function StatusBar({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-6">
      <span className="text-[10px] text-taupe/40">{time}</span>
      <div className="flex gap-1">
        <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
        <div className="h-1.5 w-1.5 rounded-sm bg-taupe/30" />
        <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
      </div>
    </div>
  );
}

function ChatHeader({ name, img }: { name: string; img: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-taupe/10 px-4 py-3">
      <Image
        src={img}
        alt={name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
      />
      <div>
        <p className="text-sm font-bold text-cream">{name}</p>
        <p className="text-[10px] text-taupe/50">Online now</p>
      </div>
    </div>
  );
}

function InputBar() {
  return (
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
  );
}

export default function Teaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
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
        className={`mb-14 text-taupe transition-all duration-700 delay-100 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        This is what your mornings could look like.
      </p>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Phone 1: Persona Picker */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <PhoneFrame className="lg:mt-12">
            <StatusBar time="9:41" />
            <div className="px-4 pb-2 pt-2">
              <p className="text-[10px] text-taupe/40 text-right">Step 1 of 3</p>
              <h3 className="mt-1 text-lg font-bold leading-tight text-cream">
                Choose your<br />first persona
              </h3>
              <p className="mt-1 text-[10px] leading-relaxed text-taupe/50">
                One is included with your subscription. You can always add more later.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 pt-2">
              {personas.map((p) => (
                <div key={p.name} className="overflow-hidden rounded-xl border border-taupe/10">
                  <div className="relative h-20">
                    <Image
                      src={p.img}
                      alt={p.name}
                      width={140}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white drop-shadow-md">
                      {p.name}
                    </span>
                  </div>
                  <div className="bg-[#2a2725] px-2 py-1.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-burgundy">
                      {p.label}
                    </p>
                    <p className="text-[8px] text-taupe/50">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-5">
              <div className="rounded-full bg-burgundy py-2.5 text-center">
                <span className="text-xs font-bold tracking-wider text-cream">Continue with Chloe</span>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Phone 2: Sienna Chat (original) */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <PhoneFrame>
            <StatusBar time="9:16 AM" />
            <ChatHeader name="Sienna" img="/logos/sienna.png" />
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
            <InputBar />
          </PhoneFrame>
        </div>

        {/* Phone 3: Photo Request Chat */}
        <div
          className={`transition-all duration-1000 delay-[400ms] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <PhoneFrame className="lg:mt-12">
            <StatusBar time="3:01 PM" />
            <ChatHeader name="Chloe" img="/logos/kai.png" />
            <div className="flex flex-col gap-2.5 px-4 py-4">
              {photoMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.from === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {"type" in msg && msg.type === "photo" ? (
                    <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-bl-md">
                      <Image
                        src="/logos/kai2.png"
                        alt="Photo from Chloe"
                        width={200}
                        height={150}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
                        msg.from === "user"
                          ? "rounded-br-md bg-burgundy/80 text-cream"
                          : "rounded-bl-md bg-taupe/15 text-cream/90"
                      }`}
                    >
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                  <span className="mt-0.5 text-[9px] text-taupe/30">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>
            <InputBar />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
