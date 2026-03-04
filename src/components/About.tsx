"use client";

import { useEffect, useRef, useState } from "react";

const values = [
  {
    title: "Always Available",
    description:
      "No scheduling, no waiting. Your persona is there whenever you are.",
  },
  {
    title: "Deeply Personal",
    description:
      "Every conversation feels real — crafted personalities that remember and adapt.",
  },
  {
    title: "Carefully Curated",
    description:
      "A handpicked roster of creator-designed personas, each with a unique voice.",
  },
];

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
      className="flex flex-col items-center px-6 py-24"
    >
      <div className="max-w-2xl text-center">
        <h2
          className={`mb-4 text-2xl font-bold tracking-[0.12em] text-dark transition-all duration-700 sm:text-3xl ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          What is CABN?
        </h2>
        <p
          className={`mb-14 text-lg leading-relaxed text-taupe transition-all duration-700 delay-100 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          CABN is where creators bring AI personas to life — and where you
          find the one that gets you. Think of it as a marketplace for
          connection, powered by personality.
        </p>

        <div className="grid gap-10 sm:grid-cols-3">
          {values.map((v, i) => (
            <div
              key={v.title}
              className={`transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-burgundy">
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-taupe">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
