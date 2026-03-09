"use client";

import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageLoading?: boolean;
}

function getMessageTime(id: string): Date {
  // Extract timestamp from message ID (format: "temp-{timestamp}" or "assistant-{timestamp}")
  const match = id.match(/(\d{13})/);
  if (match) return new Date(parseInt(match[1]));
  return new Date();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateDivider(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function shouldShowDivider(current: Message, previous: Message | null): boolean {
  if (!previous) return true;
  const currentTime = getMessageTime(current.id);
  const prevTime = getMessageTime(previous.id);
  // Show divider if more than 30 minutes apart
  return currentTime.getTime() - prevTime.getTime() > 30 * 60 * 1000;
}

export default function ChatMessages({
  messages,
  streaming,
  streamText,
}: {
  messages: Message[];
  streaming: boolean;
  streamText: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Scroll to bottom when keyboard opens (visualViewport resize)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  // Find the last user message for "Delivered" receipt
  const lastUserMsgIndex = messages.reduce(
    (last, msg, i) => (msg.role === "user" ? i : last),
    -1
  );

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3">
        {/* Spacer pushes messages to bottom when few messages */}
        <div className="flex-1" />
        {messages.map((msg, i) => {
          const prev = i > 0 ? messages[i - 1] : null;
          const showDivider = shouldShowDivider(msg, prev);
          const msgTime = getMessageTime(msg.id);

          return (
            <div key={msg.id}>
              {showDivider && (
                <div className="flex items-center justify-center py-3">
                  <p className="text-[10px] font-medium tracking-wider text-taupe/30">
                    {formatDateDivider(msgTime)}
                  </p>
                </div>
              )}
              <ChatBubble
                role={msg.role}
                content={msg.content}
                imageUrl={msg.imageUrl}
                imageLoading={msg.imageLoading}
                timestamp={formatTime(msgTime)}
                isLast={i === lastUserMsgIndex && !streaming}
              />
            </div>
          );
        })}

        {streaming && streamText && (
          <ChatBubble role="assistant" content={streamText} />
        )}

        {streaming && !streamText && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
