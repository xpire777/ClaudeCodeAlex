import TopBar from "@/components/app/TopBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CABN",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-surface text-cream">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
