"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Persona } from "@/data/personas";

export default function PersonaCard({ persona }: { persona: Persona }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list: string[] = JSON.parse(localStorage.getItem("savedPersonas") || "[]");
    setSaved(list.includes(persona.slug));
  }, [persona.slug]);

  return (
    <Link
      href={`/profile/${persona.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-taupe/10 bg-surface-light px-4 py-5 transition-colors hover:border-taupe/20"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full">
        <Image
          src={persona.image}
          alt={persona.name}
          fill
          className="object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-110"
        />
        {saved && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-burgundy/90 shadow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-cream">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-cream">{persona.name}, {persona.age}</p>
        <p className="mt-0.5 text-sm text-taupe/50">{persona.city}</p>
      </div>
    </Link>
  );
}
