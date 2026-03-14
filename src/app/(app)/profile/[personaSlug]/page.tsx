import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { personas, getPersonaBySlug } from "@/data/personas";
import VibeTag from "@/components/app/VibeTag";
import SaveForLaterButton from "@/components/app/SaveForLaterButton";

export function generateStaticParams() {
  return personas.map((p) => ({ personaSlug: p.slug }));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ personaSlug: string }>;
}) {
  const { personaSlug } = await params;
  const persona = getPersonaBySlug(personaSlug);

  if (!persona) notFound();

  return (
    <div className="mx-auto max-w-2xl pb-6">
      {/* Hero image */}
      <div className="relative aspect-[4/5] max-h-[50vh] w-full">
        <Image
          src={persona.image}
          alt={persona.name}
          fill
          className="object-cover object-[center_20%]"
          priority
        />
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent" />
        {/* Bottom fade with text */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/60 to-transparent p-5 pt-24">
          <h1 className="text-3xl font-bold tracking-wider">{persona.name}</h1>
          <p className="text-xs text-taupe/50">
            {persona.age} &middot; {persona.city}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="px-5">
        <p className="mt-2 text-sm text-taupe">
          {persona.age} &middot; {persona.city}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-cream/80">
          {persona.bio}
        </p>

        {/* Vibe tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {persona.vibeTags.map((tag) => (
            <VibeTag key={tag} label={tag} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={`/chat/${persona.slug}`}
            className="rounded-full bg-burgundy px-8 py-3 text-center text-sm font-bold tracking-wider text-cream transition-opacity hover:opacity-90"
          >
            Start Chatting
          </Link>
          <SaveForLaterButton personaSlug={persona.slug} />
        </div>
      </div>
    </div>
  );
}
