"use client";

import { useState } from "react";
import Image from "next/image";
import type { Persona } from "@/data/personas";
import PersonaAvatar from "./PersonaAvatar";
import Link from "next/link";

export default function ChatSidebar({ persona }: { persona: Persona }) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="hidden w-64 shrink-0 bg-dark/40 lg:block">
      <div className="flex flex-col items-center px-6 py-8">
        <button onClick={() => setShowFullImage(true)} className="cursor-pointer">
          <PersonaAvatar src={persona.image} name={persona.name} size={96} online={false} />
        </button>
        <h3 className="mt-4 text-base font-bold tracking-wide text-cream">
          {persona.name}
        </h3>
        <p className="mt-1.5 text-xs text-taupe/40">
          {persona.age} &middot; {persona.city}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {persona.vibeTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-taupe/10 px-2.5 py-1 text-[10px] tracking-wide text-taupe/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/profile/${persona.slug}`}
          className="mt-6 w-full rounded-xl bg-taupe/10 py-2.5 text-center text-xs font-bold tracking-wider text-taupe/60 transition-colors hover:bg-taupe/15 hover:text-taupe/80"
        >
          View Full Profile
        </Link>
      </div>

      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-h-[85vh] max-w-md overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <Image
              src={persona.image}
              alt={persona.name}
              width={400}
              height={600}
              className="h-auto max-h-[85vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
