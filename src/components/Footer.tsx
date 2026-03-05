import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-8 border-t border-taupe/20 px-6 py-16">
      <Image
        src="/logos/logo_wordmark.svg"
        alt="CABN"
        width={120}
        height={30}
      />

      <div className="flex gap-6 text-sm tracking-wide text-taupe">
        <Link href="/privacy" className="transition-colors hover:text-dark">
          Privacy Policy
        </Link>
        <Link href="/terms" className="transition-colors hover:text-dark">
          Terms
        </Link>
        <Link href="/gate" className="transition-colors hover:text-dark">
          Access
        </Link>
      </div>

      <p className="text-xs text-taupe/60">
        &copy; {new Date().getFullYear()} CABN. All rights reserved.
      </p>
    </footer>
  );
}
