"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPersonaBySlug } from "@/data/personas";
import PersonaAvatar from "@/components/app/PersonaAvatar";
import ChatMessages from "@/components/app/ChatMessages";
import ChatInput from "@/components/app/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const personaSlug = params.personaSlug as string;
  const persona = getPersonaBySlug(personaSlug);

  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Get conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("persona_slug", personaSlug)
      .single();

    if (conversation) {
      const { data: history } = await supabase
        .from("messages")
        .select("id, role, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (history) {
        setMessages(history as Message[]);
      }
    }

    setLoading(false);
  }, [personaSlug, router]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSend(message: string) {
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = { id: tempId, role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personaSlug }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamText(fullText);
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }

      // Add the complete assistant message
      if (fullText) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullText,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  if (!persona) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-taupe">Persona not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-taupe/10 px-4 py-3">
        <button onClick={() => router.back()} className="text-taupe/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <PersonaAvatar src={persona.image} name={persona.name} size={36} />
        <div>
          <p className="text-sm font-bold">{persona.name}</p>
          <p className="text-[10px] text-taupe/50">Online now</p>
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-taupe/50">Loading...</p>
        </div>
      ) : messages.length === 0 && !streaming ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
          <PersonaAvatar src={persona.image} name={persona.name} size={64} />
          <p className="mt-2 text-center text-sm font-bold">{persona.name}</p>
          <p className="text-center text-xs text-taupe/60">{persona.tagline}</p>
          <p className="mt-4 text-center text-xs text-taupe/40">
            Say hi to start the conversation
          </p>
        </div>
      ) : (
        <ChatMessages
          messages={messages}
          streaming={streaming}
          streamText={streamText}
        />
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  );
}
