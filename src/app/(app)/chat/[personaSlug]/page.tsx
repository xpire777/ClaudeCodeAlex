"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  imageUrl?: string;
  imageLoading?: boolean;
}

const PHOTO_TAG_REGEX = /\[SEND_PHOTO:\s*(.+?)\]/;

function parsePhotoTag(text: string): { cleanText: string; photoPrompt: string | null } {
  const match = text.match(PHOTO_TAG_REGEX);
  if (!match) return { cleanText: text, photoPrompt: null };
  const cleanText = text.replace(PHOTO_TAG_REGEX, "").trim();
  const photoPrompt = match[1].trim();
  return { cleanText, photoPrompt };
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
  const followUpTimer = useRef<NodeJS.Timeout | null>(null);
  const followUpSent = useRef(false);

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

  function clearFollowUp() {
    if (followUpTimer.current) {
      clearTimeout(followUpTimer.current);
      followUpTimer.current = null;
    }
  }

  async function generatePersonaImage(msgId: string, prompt: string) {
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, prompt }),
      });

      if (!res.ok) {
        console.error("Image generation failed");
        // Remove loading state
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, imageLoading: false } : m))
        );
        return;
      }

      const { imageUrl } = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, imageUrl, imageLoading: false } : m
        )
      );
    } catch (err) {
      console.error("Image generation error:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, imageLoading: false } : m))
      );
    }
  }

  function scheduleFollowUp() {
    clearFollowUp();
    if (followUpSent.current) return; // Only one follow-up per user silence
    const delay = 120000; // 2 minutes
    followUpTimer.current = setTimeout(() => {
      followUpSent.current = true;
      sendFollowUp();
    }, delay);
  }

  async function sendFollowUp() {
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, followUp: true }),
      });

      if (!res.ok) return;

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) fullText += parsed.text;
              } catch {}
            }
          }
        }
      }

      if (fullText) {
        const typingDelay = Math.max(1500, fullText.length * 50);
        await new Promise((resolve) => setTimeout(resolve, typingDelay));
        setMessages((prev) => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullText.replace(/\n+/g, " ").trim(),
        }]);
      }
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearFollowUp();
  }, []);

  async function handleSend(message: string) {
    clearFollowUp();
    followUpSent.current = false;
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = { id: tempId, role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);

    // Random "reading" delay before typing indicator appears (1-4 seconds)
    const readDelay = 1000 + Math.random() * 3000;
    await new Promise((resolve) => setTimeout(resolve, readDelay));

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
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }

      // Simulate typing delay with randomness, then show all at once
      if (fullText) {
        const baseDelay = Math.max(1500, fullText.length * 50);
        const jitter = (Math.random() - 0.5) * 2000; // +/- 1 second
        const typingDelay = Math.max(1000, baseDelay + jitter);
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        const rawContent = fullText.replace(/\n+/g, " ").trim();
        const { cleanText, photoPrompt } = parsePhotoTag(rawContent);

        const msgId = `assistant-${Date.now()}`;
        const assistantMsg: Message = {
          id: msgId,
          role: "assistant",
          content: cleanText,
          imageLoading: !!photoPrompt,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        scheduleFollowUp();

        // Generate image if persona wants to send a photo
        if (photoPrompt) {
          generatePersonaImage(msgId, photoPrompt);
        }
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  async function handleSendImage(file: File) {
    // Upload the image
    const formData = new FormData();
    formData.append("file", file);

    const tempId = `temp-img-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);

    // Show user's image immediately
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: "",
      imageUrl: localUrl,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        console.error("Failed to upload image");
        return;
      }

      const { imageUrl } = await uploadRes.json();

      // Update the message with the real URL
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, imageUrl } : m))
      );

      // Random "reading" delay
      const readDelay = 1000 + Math.random() * 3000;
      await new Promise((resolve) => setTimeout(resolve, readDelay));

      setStreaming(true);
      setStreamText("");

      // Send to chat API with the image URL
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) fullText += parsed.text;
              } catch {}
            }
          }
        }
      }

      if (fullText) {
        const baseDelay = Math.max(1500, fullText.length * 50);
        const jitter = (Math.random() - 0.5) * 2000;
        const typingDelay = Math.max(1000, baseDelay + jitter);
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        const rawContent = fullText.replace(/\n+/g, " ").trim();
        const { cleanText, photoPrompt } = parsePhotoTag(rawContent);

        const msgId = `assistant-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: msgId,
            role: "assistant",
            content: cleanText,
            imageLoading: !!photoPrompt,
          },
        ]);

        if (photoPrompt) {
          generatePersonaImage(msgId, photoPrompt);
        }
      }
    } catch (err) {
      console.error("Image send error:", err);
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
    <div className="mx-auto flex h-[calc(100dvh-4.25rem)] w-full max-w-lg flex-col overflow-x-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-taupe/10 px-4 py-3">
        <button onClick={() => router.back()} className="text-taupe/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <PersonaAvatar src={persona.image} name={persona.name} size={48} />
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
      <ChatInput onSend={handleSend} onSendImage={handleSendImage} disabled={streaming} />
    </div>
  );
}
