import TopBar from "@/components/app/TopBar";
import BottomNav from "@/components/app/BottomNav";
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
    <div className="flex min-h-dvh flex-col bg-surface text-cream">
      <TopBar />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
