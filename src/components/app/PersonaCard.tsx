import Image from "next/image";
import Link from "next/link";
import type { Persona } from "@/data/personas";

export default function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Link
      href={`/profile/${persona.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-taupe/10 bg-surface-light px-4 py-5 transition-colors hover:border-taupe/20"
    >
      <div className="relative h-52 w-52 overflow-hidden rounded-full">
        <Image
          src={persona.image}
          alt={persona.name}
          fill
          className="object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-cream">{persona.name}, {persona.age}</p>
        <p className="mt-0.5 text-sm text-taupe/50">{persona.city}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-burgundy">
          {persona.archetype}
        </p>
        <p className="mt-1 text-sm text-taupe/60">{persona.tagline}</p>
      </div>
    </Link>
  );
}
