import { blogPosts } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - CABN | AI Companion Insights & Updates",
  description:
    "Explore the world of AI companions. Articles on AI relationships, companion apps, and the future of digital connection.",
  keywords: [
    "ai companion blog",
    "ai girlfriend blog",
    "ai companion apps",
    "ai relationship",
  ],
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="mb-4 text-4xl font-bold tracking-[0.12em] text-dark sm:text-5xl">
        Blog
      </h1>
      <p className="mb-16 text-lg text-taupe">
        Thoughts on AI companions, connection, and the future of relationships.
      </p>

      <div className="grid gap-10 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-taupe/15 transition-all hover:border-burgundy/30 hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden bg-dark/5">
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={200}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-center gap-3 text-xs text-taupe">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="mb-2 text-lg font-bold leading-snug text-dark group-hover:text-burgundy transition-colors">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-taupe line-clamp-3">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
