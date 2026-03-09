"use client";

import { useState } from "react";

const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

export default function ChatBubble({
  role,
  content,
  imageUrl,
  imageLoading,
  timestamp,
  isLast,
}: {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageLoading?: boolean;
  timestamp?: string;
  isLast?: boolean;
}) {
  const isUser = role === "user";
  const hasText = content.trim().length > 0;
  const [reaction, setReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      {hasText && (
        <div
          className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
            isUser
              ? "rounded-br-md bg-burgundy/80 text-cream"
              : "rounded-bl-md bg-taupe/15 text-cream/90"
          }`}
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>

          {/* Reaction display */}
          {reaction && (
            <div
              className={`absolute -bottom-3 ${
                isUser ? "left-1" : "right-1"
              } rounded-full bg-surface-light px-1.5 py-0.5 text-xs shadow-sm`}
            >
              {reaction}
            </div>
          )}
        </div>
      )}

      {/* Reaction picker */}
      {showReactions && (
        <div
          className={`flex gap-1 rounded-full bg-surface-light px-2 py-1 shadow-lg ${
            isUser ? "self-end" : "self-start"
          }`}
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setReaction(reaction === emoji ? null : emoji);
                setShowReactions(false);
              }}
              className={`rounded-full px-1.5 py-0.5 text-sm transition-transform hover:scale-125 ${
                reaction === emoji ? "bg-taupe/20" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {imageLoading && (
        <div className="max-w-[70%] rounded-2xl rounded-bl-md bg-taupe/15 p-3">
          <div className="flex items-center gap-2 text-xs text-taupe/60">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-taupe/30 border-t-taupe/60" />
            Sending photo...
          </div>
        </div>
      )}

      {imageUrl && (
        <>
          <button
            className={`max-w-[70%] overflow-hidden rounded-2xl ${
              isUser ? "rounded-br-md" : "rounded-bl-md"
            }`}
            onClick={() => setLightbox(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Photo"
              className="block min-h-[100px] w-full object-cover"
              loading="eager"
            />
          </button>

          {lightbox && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setLightbox(false)}
            >
              <button
                onClick={() => setLightbox(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-dark/70 text-taupe transition-colors hover:text-cream"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Photo"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}

      {/* Timestamp + Read receipt */}
      {timestamp && (
        <div className={`flex items-center gap-1 ${isUser ? "self-end" : "self-start"}`}>
          <p className="text-[10px] text-taupe/30">{timestamp}</p>
          {isUser && isLast && (
            <p className="text-[10px] text-taupe/40">Delivered</p>
          )}
        </div>
      )}
    </div>
  );
}
