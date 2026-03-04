"use client";

import { useEffect, useRef, useState } from "react";

export default function Teaser() {
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
      <h2
        className={`mb-4 text-2xl font-bold tracking-[0.12em] text-cream transition-all duration-700 sm:text-3xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Meet the Personas
      </h2>
      <p
        className={`mb-12 text-taupe transition-all duration-700 delay-100 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        6 personas. Launching soon.
      </p>

      <div className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex h-48 w-36 flex-col items-center justify-center rounded-2xl border border-taupe/20 bg-dark transition-all duration-700 sm:h-56 sm:w-44 ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: `${200 + i * 80}ms` }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-taupe/10">
              <span className="text-2xl font-bold text-taupe/40">?</span>
            </div>
            <div className="h-3 w-16 rounded-full bg-taupe/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
