export default function ChatBubble({
  role,
  content,
  imageUrl,
  imageLoading,
}: {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageLoading?: boolean;
}) {
  const isUser = role === "user";
  const hasText = content.trim().length > 0;

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
      {hasText && (
        <div
          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
            isUser
              ? "rounded-br-md bg-burgundy/80 text-cream"
              : "rounded-bl-md bg-taupe/15 text-cream/90"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
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
        <div
          className={`max-w-[70%] overflow-hidden rounded-2xl ${
            isUser ? "rounded-br-md" : "rounded-bl-md"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Photo"
            className="h-auto w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
