"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPersonaBySlug } from "@/data/personas";
import PersonaCard from "@/components/app/PersonaCard";

export default function SavedPage() {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("savedPersonas") || "[]");
    setSavedSlugs(list);
    setLoaded(true);
  }, []);

  const savedPersonas = savedSlugs
    .map((slug) => getPersonaBySlug(slug))
    .filter(Boolean);

  return (
    <div className="px-24 py-6">
      <h1 className="mb-1 text-xl font-bold tracking-wider">Saved</h1>
      <p className="mb-6 text-sm text-taupe">Personas you saved for later</p>

      {!loaded ? (
        <p className="text-sm text-taupe/50">Loading...</p>
      ) : savedPersonas.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-taupe/30">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm text-taupe/50">No saved personas yet</p>
          <button
            onClick={() => router.push("/discover")}
            className="mt-2 rounded-full bg-burgundy/80 px-5 py-2 text-xs font-bold tracking-wider text-cream"
          >
            Discover Personas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-10">
          {savedPersonas.map((persona) => (
            <PersonaCard key={persona!.slug} persona={persona!} />
          ))}
        </div>
      )}
    </div>
  );
}
