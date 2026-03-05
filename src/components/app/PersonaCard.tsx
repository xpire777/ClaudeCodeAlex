import Image from "next/image";
import Link from "next/link";
import type { Persona } from "@/data/personas";

export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Link
      href={`/profile/${persona.slug}`}
      className="group overflow-hidden rounded-2xl border border-taupe/10 bg-surface-light transition-colors hover:border-taupe/20"
    >
      <div className="relative aspect-[3/4]">
        <Image
          src={persona.image}
          alt={persona.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
          <p className="text-lg font-bold text-cream">{persona.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy">
            {persona.archetype}
          </p>
          <p className="mt-1 text-xs text-taupe/70">{persona.tagline}</p>
        </div>
      </div>
    </Link>
  );
}
