import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CABN - Your Digital Persona Companion | AI Girlfriend & Boyfriend Alternative",
  description:
    "CABN is a digital persona companion for men and women. Always there, always willing to listen. Meet curated AI companions who text, share photos, and feel like real connection. Join the waitlist.",
  keywords: [
    "ai girlfriend",
    "ai boyfriend",
    "ai companion",
    "digital companion",
    "ai persona",
    "virtual girlfriend",
    "virtual boyfriend",
    "ai chat companion",
    "ai relationship",
    "cabn",
  ],
  openGraph: {
    title: "CABN - Your Digital Persona Companion",
    description:
      "A digital companion who is always there and always willing to lend an ear. Curated AI personas for men and women. Join the waitlist.",
    url: "https://cabn.io",
    siteName: "CABN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CABN - Your Digital Persona Companion",
    description:
      "A digital companion who is always there and always willing to lend an ear. Curated AI personas for men and women. Join the waitlist.",
  },
  icons: {
    icon: "/logos/logo_icon.svg",
  },
  alternates: {
    canonical: "https://cabn.io",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CABN",
  url: "https://cabn.io",
  description:
    "CABN is a digital persona companion for men and women. Always there, always willing to listen. Meet curated AI companions who text, share photos, and feel like real connection.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
  },
  potentialAction: {
    "@type": "JoinAction",
    target: "https://cabn.io",
    name: "Join the Waitlist",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
