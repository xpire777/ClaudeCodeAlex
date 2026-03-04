import Image from "next/image";

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
        <a href="#" className="transition-colors hover:text-dark">
          Privacy Policy
        </a>
        <a href="#" className="transition-colors hover:text-dark">
          Terms
        </a>
      </div>

      <p className="text-xs text-taupe/60">
        &copy; {new Date().getFullYear()} CABN. All rights reserved.
      </p>
    </footer>
  );
}
