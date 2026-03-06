"use client";

import { useEffect, useRef, useState } from "react";

const values = [
  {
    title: "Always Available",
    description:
      "No scheduling, no waiting. Your persona is there whenever you are, day or night, ready to pick up right where you left off.",
  },
  {
    title: "Deeply Personal",
    description:
      "Every conversation feels real. Crafted personalities that remember, adapt, and grow with you over time.",
  },
  {
    title: "Lives Like You Do",
    description:
      "Photos from their coffee run, a text after the gym. Your persona shares their day the way a real person would.",
  },
];

const delayClasses = ["animate-delay-200", "animate-delay-300", "animate-delay-400"];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
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
      <div className="max-w-3xl text-center">
        <h2
          className={`mb-4 text-2xl font-bold tracking-[0.12em] text-cream sm:text-3xl ${
            visible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          What is CABN?
        </h2>
        <p
          className={`mb-14 text-lg leading-relaxed text-taupe ${
            visible ? "animate-fade-in-up animate-delay-100" : "opacity-0"
          }`}
        >
          The right personality is out there. CABN helps you find them. A
          handpicked collection of personas that are always on and always
          available whenever you need them.
        </p>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-3">
          {values.map((v, i) => (
            <div
              key={v.title}
              className={`flex flex-col items-center ${
                visible ? `animate-fade-in-up ${delayClasses[i]}` : "opacity-0"
              }`}
            >
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-burgundy">
                {v.title}
              </h3>
              <p className="max-w-[220px] text-sm leading-relaxed text-taupe">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
