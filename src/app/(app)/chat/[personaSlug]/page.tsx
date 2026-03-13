"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPersonaBySlug } from "@/data/personas";
import PersonaAvatar from "@/components/app/PersonaAvatar";
import ChatMessages from "@/components/app/ChatMessages";
import ChatInput from "@/components/app/ChatInput";
import ChatSidebar from "@/components/app/ChatSidebar";
import ChatConversationList from "@/components/app/ChatConversationList";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageLoading?: boolean;
}

const PHOTO_TAG_REGEX = /\[SEND_PHOTO:\s*(.+?)\]/;
const MEMORY_TAG_REGEX = /\[MEMORY:\s*[^|]+?\s*\|\s*.+?\]/g;
const PHOTO_CONTEXT_REGEX = /\[You sent a photo:\s*.+?\]/g;

function parsePhotoTag(text: string): { cleanText: string; photoPrompt: string | null } {
  const match = text.match(PHOTO_TAG_REGEX);
  // Strip memory tags and photo context markers from display
  const stripped = text
    .replace(MEMORY_TAG_REGEX, "")
    .replace(PHOTO_CONTEXT_REGEX, "")
    .trim();
  if (!match) return { cleanText: stripped, photoPrompt: null };
  const cleanText = stripped.replace(PHOTO_TAG_REGEX, "").trim();
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
  const [confirmingErase, setConfirmingErase] = useState(false);
  const followUpTimer = useRef<NodeJS.Timeout | null>(null);
  const followUpSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isBusyRef = useRef(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        .select("id, role, content, image_url")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (history) {
        setMessages(
          (history as (Message & { image_url?: string })[]).map((msg) => {
            const base = { ...msg, imageUrl: msg.image_url || undefined };
            if (msg.role === "assistant") {
              const { cleanText } = parsePhotoTag(msg.content);
              return { ...base, content: cleanText };
            }
            // Restore user-sent images from [IMAGE: url] content
            const imgMatch = msg.content?.match(/\[IMAGE:\s*(https?:\/\/[^\]]+)\]/);
            if (imgMatch && msg.role === "user") {
              const textPart = msg.content.replace(/\[IMAGE:\s*https?:\/\/[^\]]+\]/, "").trim();
              return { ...base, content: textPart, imageUrl: imgMatch[1] };
            }
            return base;
          })
        );
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
      // Start the prediction (returns immediately)
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, prompt }),
      });

      if (!res.ok) {
        console.error("Image generation failed to start");
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, imageLoading: false } : m))
        );
        return;
      }

      const { predictionId } = await res.json();

      // Poll for result
      let attempts = 0;
      const maxAttempts = 60; // 60 * 2s = 2 minutes max
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        const statusRes = await fetch(`/api/prediction-status?id=${predictionId}`);
        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();

        if (statusData.status === "succeeded" && statusData.imageUrl) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, imageUrl: statusData.imageUrl, imageLoading: false } : m
            )
          );

          // Persist image URL to the most recent assistant message in DB
          try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: conv } = await supabase
                .from("conversations")
                .select("id")
                .eq("user_id", user.id)
                .eq("persona_slug", personaSlug)
                .single();
              if (conv) {
                const { data: lastMsg } = await supabase
                  .from("messages")
                  .select("id")
                  .eq("conversation_id", conv.id)
                  .eq("role", "assistant")
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single();
                if (lastMsg) {
                  await supabase
                    .from("messages")
                    .update({ image_url: statusData.imageUrl })
                    .eq("id", lastMsg.id);
                }
              }
            }
          } catch {
            // Non-critical — image still shows in current session
          }

          return;
        }

        if (statusData.status === "failed") {
          console.error("Image generation failed:", statusData.error);
          break;
        }
      }

      // If we get here, it failed or timed out
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, imageLoading: false } : m))
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
    if (isBusyRef.current) return; // Don't send follow-up if already processing
    isBusyRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    startSafetyTimer();
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, followUp: true }),
        signal: controller.signal,
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
        await cancelableDelay(typingDelay, controller.signal);
        setMessages((prev) => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullText.replace(/\n+/g, " ").trim(),
        }]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Follow-up error:", err);
    } finally {
      clearSafetyTimer();
      abortControllerRef.current = null;
      isBusyRef.current = false;
      setStreaming(false);
      setStreamText("");
    }
  }

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearFollowUp();
      clearSafetyTimer();
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Safety net: if streaming is stuck for 30s, force-reset all state
  function startSafetyTimer() {
    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => {
      console.warn("[chat] Safety timer fired — force-resetting stuck state");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isBusyRef.current = false;
      setStreaming(false);
      setStreamText("");
    }, 30000);
  }

  function clearSafetyTimer() {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }

  function cancelableDelay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
      const timer = setTimeout(resolve, ms);
      signal.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
    });
  }

  async function handleSend(message: string) {
    clearFollowUp();
    followUpSent.current = false;
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = { id: tempId, role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);

    // Cancel any pending timer — we'll restart it
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }

    // If an API request is in flight (or in a delay), abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Always reset busy state when user sends a new message
    isBusyRef.current = false;
    clearSafetyTimer();
    setStreaming(false);
    setStreamText("");

    // Wait 1.5s for more messages, then send the API call
    pendingTimerRef.current = setTimeout(() => {
      pendingTimerRef.current = null;
      sendToApi(message);
    }, 1500);
  }

  async function sendToApi(message: string) {
    if (isBusyRef.current) return;
    isBusyRef.current = true;

    // Create abort controller immediately so it can be cancelled at any point
    const controller = new AbortController();
    abortControllerRef.current = controller;
    startSafetyTimer();

    try {
      // Random "reading" delay (0.5-2 seconds) — cancelable
      await cancelableDelay(500 + Math.random() * 1500, controller.signal);

      setStreaming(true);
      setStreamText("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, personaSlug }),
        signal: controller.signal,
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

      // Simulate typing delay — cancelable
      if (fullText) {
        const baseDelay = Math.max(1500, fullText.length * 50);
        const jitter = (Math.random() - 0.5) * 2000;
        const typingDelay = Math.max(1000, baseDelay + jitter);
        await cancelableDelay(typingDelay, controller.signal);

        const rawContent = fullText.replace(/\n+/g, " ").trim();
        console.log("[chat] Raw AI response:", rawContent);
        const { cleanText, photoPrompt } = parsePhotoTag(rawContent);
        console.log("[chat] Parsed — cleanText:", cleanText, "photoPrompt:", photoPrompt);

        const msgId = `assistant-${Date.now()}`;
        const assistantMsg: Message = {
          id: msgId,
          role: "assistant",
          content: cleanText,
          imageLoading: !!photoPrompt,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        scheduleFollowUp();

        if (photoPrompt) {
          generatePersonaImage(msgId, photoPrompt);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Send error:", err);
    } finally {
      clearSafetyTimer();
      abortControllerRef.current = null;
      isBusyRef.current = false;
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

    // Cancel any in-flight work
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isBusyRef.current = false;
    clearSafetyTimer();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isBusyRef.current = true;
    startSafetyTimer();

    try {
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
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

      // Random "reading" delay — cancelable
      await cancelableDelay(1000 + Math.random() * 3000, controller.signal);

      setStreaming(true);
      setStreamText("");

      // Send to chat API with the image URL
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaSlug, imageUrl }),
        signal: controller.signal,
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
        await cancelableDelay(typingDelay, controller.signal);

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
      if ((err as Error).name === "AbortError") return;
      console.error("Image send error:", err);
    } finally {
      clearSafetyTimer();
      abortControllerRef.current = null;
      isBusyRef.current = false;
      setStreaming(false);
      setStreamText("");
    }
  }

  async function eraseConversation() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("persona_slug", personaSlug)
      .single();

    if (conversation) {
      await supabase.from("messages").delete().eq("conversation_id", conversation.id);
      await supabase.from("conversations").delete().eq("id", conversation.id);
    }

    // Also erase persona memories so it truly starts fresh
    await supabase
      .from("persona_memories")
      .delete()
      .eq("user_id", user.id)
      .eq("persona_slug", personaSlug);

    // Reset all local state
    setMessages([]);
    setConfirmingErase(false);
    clearFollowUp();
    followUpSent.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    isBusyRef.current = false;
    clearSafetyTimer();
    setStreaming(false);
    setStreamText("");
  }

  if (!persona) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-taupe">Persona not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.25rem)] w-full max-w-7xl overflow-x-hidden">
      {/* Left sidebar — conversations list */}
      <ChatConversationList currentSlug={personaSlug} />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
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
          <div className="ml-auto">
            {confirmingErase ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-taupe/60">Are you sure?</span>
                <button
                  onClick={eraseConversation}
                  className="rounded-full bg-red-600/80 px-3 py-1 text-[10px] font-bold tracking-wider text-cream transition-opacity hover:opacity-90"
                >
                  Erase
                </button>
                <button
                  onClick={() => setConfirmingErase(false)}
                  className="rounded-full border border-taupe/20 px-3 py-1 text-[10px] font-bold tracking-wider text-taupe transition-colors hover:text-cream"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingErase(true)}
                className="rounded-full border border-taupe/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-taupe/50 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                Erase All
              </button>
            )}
          </div>
        </div>

        {/* Messages with subtle background */}
        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/0 via-burgundy/[0.02] to-surface/0" />
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-taupe/50">Loading...</p>
            </div>
          ) : messages.length === 0 && !streaming ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-8">
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
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} onSendImage={handleSendImage} disabled={false} />
      </div>

      {/* Desktop sidebar */}
      <ChatSidebar persona={persona} />
    </div>
  );
}
