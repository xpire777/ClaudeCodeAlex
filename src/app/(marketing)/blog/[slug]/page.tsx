import { blogPosts } from "@/data/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | CABN Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  // Simple markdown-ish rendering: split by ## for headings, ** for bold
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2
            key={key++}
            className="mb-4 mt-10 text-2xl font-bold text-dark first:mt-0"
          >
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={key++} className="mb-3 mt-8 text-xl font-bold text-dark">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith("- ")) {
        elements.push(
          <li key={key++} className="mb-1 ml-6 list-disc text-base leading-relaxed text-dark/80">
            {renderInline(trimmed.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <li key={key++} className="mb-1 ml-6 list-decimal text-base leading-relaxed text-dark/80">
            {renderInline(trimmed.replace(/^\d+\.\s/, ""))}
          </li>
        );
      } else {
        elements.push(
          <p key={key++} className="mb-4 text-base leading-relaxed text-dark/80">
            {renderInline(trimmed)}
          </p>
        );
      }
    }

    return elements;
  };

  const renderInline = (text: string) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-dark">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-taupe hover:text-burgundy transition-colors"
      >
        &larr; Back to Blog
      </Link>

      <div className="mb-6 flex items-center gap-3 text-sm text-taupe">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>

      <h1 className="mb-6 text-3xl font-bold leading-tight text-dark sm:text-4xl">
        {post.title}
      </h1>

      <p className="mb-10 text-lg leading-relaxed text-taupe">
        {post.description}
      </p>

      <div className="relative mb-10 h-64 overflow-hidden rounded-2xl sm:h-80">
        <Image
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="prose-cabn">{renderContent(post.content)}</div>

      {/* Waitlist CTA */}
      <div className="mt-16 rounded-2xl bg-dark p-8 text-center">
        <h3 className="mb-2 text-xl font-bold text-cream">
          Ready to experience CABN?
        </h3>
        <p className="mb-6 text-sm text-taupe">
          Join the waitlist and be the first to connect.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-burgundy px-8 py-3 font-bold tracking-wider text-cream transition-all hover:bg-burgundy/90"
        >
          Join the Waitlist
        </Link>
      </div>
    </article>
  );
}
