"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { personas, getPersonaBySlug, type Persona } from "@/data/personas";
import PersonaAvatar from "@/components/app/PersonaAvatar";

interface Conversation {
  id: string;
  persona_slug: string;
  last_message_at: string;
  last_message?: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function BentoTile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-taupe/10 bg-surface-light p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-taupe/50">
      {children}
    </h2>
  );
}

function MiniPersona({ persona }: { persona: Persona }) {
  return (
    <Link
      href={`/profile/${persona.slug}`}
      className="group flex shrink-0 flex-col items-center gap-2"
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-xl ring-2 ring-taupe/10 transition-all group-hover:ring-burgundy/40">
        <Image
          src={persona.image}
          alt={persona.name}
          fill
          className="object-cover object-[center_20%]"
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-cream">{persona.name}</p>
        <p className="text-[10px] text-taupe/40">{persona.archetype}</p>
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [chattedSlugs, setChattedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: convos } = await supabase
        .from("conversations")
        .select("id, persona_slug, last_message_at")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false });

      if (convos) {
        setChattedSlugs(convos.map((c) => c.persona_slug));

        const withMessages = await Promise.all(
          convos.slice(0, 3).map(async (conv) => {
            const { data: msgs } = await supabase
              .from("messages")
              .select("content, role")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1);

            return { ...conv, last_message: msgs?.[0]?.content };
          })
        );
        setConversations(withMessages);
      }

      const saved = JSON.parse(localStorage.getItem("savedPersonas") || "[]");
      setSavedSlugs(saved);
      setLoading(false);
    }

    load();
  }, [router]);

  const savedPersonas = savedSlugs
    .map((slug) => getPersonaBySlug(slug))
    .filter((p): p is Persona => Boolean(p));

  const suggestedPersonas = personas.filter(
    (p) => !chattedSlugs.includes(p.slug)
  );
  const suggestedFinal =
    suggestedPersonas.length > 0 ? suggestedPersonas.slice(0, 3) : personas.slice(0, 3);

  const featuredPersona = getPersonaBySlug("sienna")!;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-taupe/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      {/* Bento Grid */}
      <div className="grid flex-1 auto-rows-min grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {/* New Personas — spans 2 cols, top-left */}
        <BentoTile className="md:col-span-2">
          <SectionLabel>New Personas</SectionLabel>
          <div className="scrollbar-hide -mx-1 flex gap-5 overflow-x-auto px-1 py-1 md:flex-wrap md:overflow-visible">
            {personas.map((persona) => (
              <MiniPersona key={persona.slug} persona={persona} />
            ))}
          </div>
        </BentoTile>

        {/* Ongoing Chats — right column, spans 2 rows */}
        <BentoTile className="md:row-span-2 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Chats</SectionLabel>
            {conversations.length > 0 && (
              <Link
                href="/chats"
                className="text-[10px] font-bold tracking-wider text-burgundy"
              >
                View all
              </Link>
            )}
          </div>
          {conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-taupe/20"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-xs text-taupe/40">No conversations yet</p>
              <button
                onClick={() => router.push("/discover")}
                className="rounded-full bg-burgundy/80 px-4 py-1.5 text-[10px] font-bold tracking-wider text-cream"
              >
                Start chatting
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversations.map((conv) => {
                const persona = getPersonaBySlug(conv.persona_slug);
                if (!persona) return null;

                return (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/chat/${conv.persona_slug}`)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-lighter"
                  >
                    <PersonaAvatar
                      src={persona.image}
                      name={persona.name}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{persona.name}</p>
                        <span className="text-[9px] text-taupe/40">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      {conv.last_message && (
                        <p className="mt-0.5 truncate text-[11px] text-taupe/50">
                          {conv.last_message}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </BentoTile>

        {/* Saved Personas — bottom-left of first two rows */}
        <BentoTile>
          <SectionLabel>Saved</SectionLabel>
          {savedPersonas.length === 0 ? (
            <p className="text-xs text-taupe/30">
              Save personas from their profile page
            </p>
          ) : (
            <div className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1 py-1">
              {savedPersonas.map((persona) => (
                <MiniPersona key={persona.slug} persona={persona} />
              ))}
            </div>
          )}
        </BentoTile>

        {/* Coming Soon: Gifting */}
        <BentoTile className="border-burgundy/20 bg-dark">
          <span className="inline-block rounded-full bg-burgundy/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-burgundy">
            Coming Soon
          </span>
          <h3 className="mt-2 text-base font-bold tracking-wider text-cream">
            Gifting Tier
          </h3>
          <p className="mt-1 text-xs text-taupe/50">
            Real gifts from your persona. Flowers, birthday cards, and thoughtful surprises delivered to your door.
          </p>
          <button
            disabled
            className="mt-3 rounded-full bg-burgundy/20 px-4 py-1.5 text-[10px] font-bold tracking-wider text-burgundy/40 cursor-not-allowed"
          >
            Notify Me
          </button>
        </BentoTile>

        {/* Suggested For You — spans 2 cols */}
        <BentoTile className="md:col-span-2">
          <SectionLabel>Suggested For You</SectionLabel>
          <div className="scrollbar-hide -mx-1 flex gap-5 overflow-x-auto px-1 py-1">
            {suggestedFinal.map((persona) => (
              <MiniPersona key={persona.slug} persona={persona} />
            ))}
          </div>
        </BentoTile>

        {/* Most Popular — right column */}
        <BentoTile className="overflow-hidden p-0">
          <Link
            href={`/profile/${featuredPersona.slug}`}
            className="group block h-full"
          >
            <div className="relative h-36 w-full">
              <Image
                src={featuredPersona.image}
                alt={featuredPersona.name}
                fill
                className="object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-light via-surface-light/40 to-transparent" />
              <span className="absolute left-4 top-3 rounded-full bg-burgundy/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cream">
                Fan Favorite
              </span>
            </div>
            <div className="px-5 pb-4 pt-2">
              <p className="text-sm font-bold text-cream">
                {featuredPersona.name}, {featuredPersona.age}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-burgundy">
                {featuredPersona.archetype}
              </p>
              <p className="mt-1 text-xs text-taupe/50">
                {featuredPersona.tagline}
              </p>
            </div>
          </Link>
        </BentoTile>
      </div>
    </div>
  );
}
