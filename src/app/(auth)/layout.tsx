import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CABN - Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6">
      <div className="mb-8">
        <Image
          src="/logos/logo_reversed.svg"
          alt="CABN"
          width={120}
          height={40}
          priority
        />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
