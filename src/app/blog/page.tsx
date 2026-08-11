import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { BOOKING_URL } from "@/lib/content";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Barbershop Tips & Guides — Antioch CA",
  description:
    "Local grooming tips, fade guides, and barbershop news from The Barber Lounge in Antioch, CA.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionLabel>Blog</SectionLabel>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
              Barbershop Tips & Local Guides
            </h1>
            <p className="mt-4 text-lg text-charcoal/70">
              Grooming advice, fade guides, and insights from Antioch&apos;s premier barbershop.
            </p>
          </div>

          <ul className="mt-12 space-y-6">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <article className="rounded-xl border border-charcoal/10 bg-white/50 p-6">
                  <time dateTime={post.publishedAt} className="text-sm text-charcoal/60">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal">
                    <Link href={`/blog/${post.slug}`} className="hover:text-brass">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-charcoal/70">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-charcoal hover:text-brass"
                  >
                    Read article
                  </Link>
                </article>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href={BOOKING_URL} external>
              Book Your Appointment
            </Button>
            <Button href="/services" variant="outline">
              View Our Services
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
