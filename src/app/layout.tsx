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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CABN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CABN is a digital persona companion platform. We offer a curated collection of personas that you can chat with, receive photos from, and build a real connection with. Think of it as having someone who is always there and always willing to lend an ear.",
      },
    },
    {
      "@type": "Question",
      name: "Who is CABN for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CABN is for everyone. Whether you're looking for companionship, conversation, or just someone to share your day with, our personas are designed for both men and women.",
      },
    },
    {
      "@type": "Question",
      name: "How does CABN work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Once CABN launches, you'll pick a persona that matches your vibe. From there, you can text them anytime, request photos, and build an ongoing connection. Your persona remembers your conversations and grows with you over time.",
      },
    },
    {
      "@type": "Question",
      name: "Is CABN free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CABN will offer a subscription plan that includes access to your chosen persona. Pricing details will be announced at launch. Join the waitlist to get early access and special offers.",
      },
    },
    {
      "@type": "Question",
      name: "When does CABN launch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We're launching soon. Join the waitlist to be the first to know when we go live.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch personas on CABN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. While you'll start with one persona, you'll be able to explore others and add more to your experience over time.",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
