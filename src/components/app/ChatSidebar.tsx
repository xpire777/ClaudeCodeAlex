import type { Persona } from "@/data/personas";
import PersonaAvatar from "./PersonaAvatar";
import Link from "next/link";

export default function ChatSidebar({ persona }: { persona: Persona }) {
  return (
    <div className="hidden w-72 shrink-0 border-l border-taupe/10 bg-gradient-to-b from-dark/90 to-dark lg:block">
      <div className="flex flex-col items-center px-6 py-8">
        <PersonaAvatar src={persona.image} name={persona.name} size={96} />
        <h3 className="mt-4 text-base font-bold tracking-wide text-cream">
          {persona.name}
        </h3>
        <p className="mt-1 text-xs text-taupe/50">{persona.archetype}</p>
        <p className="mt-0.5 text-xs text-taupe/40">
          {persona.age} &middot; {persona.city}
        </p>

        <p className="mt-4 text-center text-xs leading-relaxed text-taupe/50">
          {persona.tagline}
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
    </div>
  );
}
