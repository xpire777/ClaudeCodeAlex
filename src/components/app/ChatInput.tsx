"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatInput({
  onSend,
  onSendImage,
  disabled,
}: {
  onSend: (message: string) => void;
  onSendImage: (file: File) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onSendImage(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-taupe/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-taupe/50 transition-colors hover:text-taupe disabled:opacity-30"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy/80 transition-opacity hover:opacity-90 disabled:opacity-30"
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
