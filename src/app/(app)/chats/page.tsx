"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPersonaBySlug } from "@/data/personas";
import PersonaAvatar from "@/components/app/PersonaAvatar";

interface Conversation {
  id: string;
  persona_slug: string;
  last_message_at: string;
  last_message?: string;
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
        // Get last message for each conversation
        const withMessages = await Promise.all(
          convos.map(async (conv) => {
            const { data: msgs } = await supabase
              .from("messages")
              .select("content, role")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1);

            return {
              ...conv,
              last_message: msgs?.[0]?.content,
            };
          })
        );
        setConversations(withMessages);
      }

      setLoading(false);
    }

    load();
  }, [router]);

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

  return (
    <div className="px-5 py-6">
      <h1 className="mb-6 text-xl font-bold tracking-wider">Chats</h1>

      {loading ? (
        <p className="text-sm text-taupe/50">Loading...</p>
      ) : conversations.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-taupe/30">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm text-taupe/50">No conversations yet</p>
          <button
            onClick={() => router.push("/discover")}
            className="mt-2 rounded-full bg-burgundy/80 px-5 py-2 text-xs font-bold tracking-wider text-cream"
          >
            Discover Personas
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
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-light"
              >
                <PersonaAvatar
                  src={persona.image}
                  name={persona.name}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{persona.name}</p>
                    <span className="text-[10px] text-taupe/40">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="mt-0.5 truncate text-xs text-taupe/60">
                      {conv.last_message}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
