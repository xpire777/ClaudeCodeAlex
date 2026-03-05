"use client";

import { useState } from "react";

export default function SaveForLaterButton({ personaSlug }: { personaSlug: string }) {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const list = JSON.parse(localStorage.getItem("savedPersonas") || "[]");
    return list.includes(personaSlug);
  });

  function toggle() {
    const list: string[] = JSON.parse(localStorage.getItem("savedPersonas") || "[]");
    if (saved) {
      const updated = list.filter((s) => s !== personaSlug);
      localStorage.setItem("savedPersonas", JSON.stringify(updated));
    } else {
      list.push(personaSlug);
      localStorage.setItem("savedPersonas", JSON.stringify(list));
    }
    setSaved(!saved);
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-full border px-8 py-3 text-sm font-bold tracking-wider transition-colors ${
        saved
          ? "border-burgundy bg-burgundy/10 text-burgundy"
          : "border-taupe/30 text-taupe hover:border-taupe/50"
      }`}
    >
      {saved ? "Saved" : "Save for Later"}
    </button>
  );
}
