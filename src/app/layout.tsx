import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CABN - Coming Soon",
  description:
    "CABN is an AI-powered creator persona marketplace. Join the waitlist to be the first to know when we launch.",
  openGraph: {
    title: "CABN - Coming Soon",
    description:
      "An AI-powered creator persona marketplace. Join the waitlist.",
    url: "https://cabn.io",
    siteName: "CABN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CABN - Coming Soon",
    description:
      "An AI-powered creator persona marketplace. Join the waitlist.",
  },
  icons: {
    icon: "/logos/logo_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
