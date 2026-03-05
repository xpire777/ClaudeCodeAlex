import Image from "next/image";

export default function PersonaAvatar({
  src,
  name,
  size = 40,
  online = true,
}: {
  src: string;
  name: string;
  size?: number;
  online?: boolean;
}) {
  return (
    <div className="relative inline-block">
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-green-500" />
      )}
    </div>
  );
}
