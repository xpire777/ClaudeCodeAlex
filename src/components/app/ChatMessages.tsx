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

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3">
        {/* Spacer pushes messages to bottom when few messages */}
        <div className="flex-1" />
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            imageUrl={msg.imageUrl}
            imageLoading={msg.imageLoading}
          />
        ))}

        {streaming && streamText && (
          <ChatBubble role="assistant" content={streamText} />
        )}

        {streaming && !streamText && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
