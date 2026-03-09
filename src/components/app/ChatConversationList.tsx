"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPersonaBySlug } from "@/data/personas";
import PersonaAvatar from "./PersonaAvatar";

interface ConversationPreview {
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

export default function ChatConversationList({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: convos } = await supabase
        .from("conversations")
        .select("id, persona_slug, last_message_at")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false });

      if (!convos) return;

      const withMessages = await Promise.all(
        convos.map(async (conv) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            persona_slug: conv.persona_slug,
            last_message_at: conv.last_message_at,
            last_message: msgs?.[0]?.content,
          };
        })
      );

      setConversations(withMessages);
    }

    load();
  }, []);

  if (conversations.length === 0) return null;

  return (
    <div className="hidden w-72 shrink-0 border-r border-taupe/10 lg:flex lg:flex-col">
      <div className="border-b border-taupe/10 px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-taupe/50">
          Messages
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const persona = getPersonaBySlug(conv.persona_slug);
          if (!persona) return null;
          const isActive = conv.persona_slug === currentSlug;

          return (
            <button
              key={conv.persona_slug}
              onClick={() => router.push(`/chat/${conv.persona_slug}`)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? "bg-burgundy/10 border-r-2 border-burgundy"
                  : "hover:bg-surface-lighter"
              }`}
            >
              <PersonaAvatar
                src={persona.image}
                name={persona.name}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-bold ${
                      isActive ? "text-cream" : "text-cream/80"
                    }`}
                  >
                    {persona.name}
                  </p>
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
    </div>
  );
}
