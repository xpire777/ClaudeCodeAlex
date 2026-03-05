export default function VibeTag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-taupe/20 px-3 py-1 text-xs text-taupe">
      {label}
    </span>
  );
}
