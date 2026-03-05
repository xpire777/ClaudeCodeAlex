import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-taupe/10 px-5 py-3">
      <Link href="/discover">
        <Image
          src="/logos/logo_reversed.svg"
          alt="CABN"
          width={80}
          height={28}
          priority
        />
      </Link>
    </header>
  );
}
