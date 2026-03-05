"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-taupe/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Message..."
        autoFocus
        className="flex-1 rounded-full bg-taupe/10 px-4 py-2.5 text-sm text-cream placeholder:text-taupe/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/80 transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-cream"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  );
}
