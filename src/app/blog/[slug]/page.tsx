import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { getBlogContent } from "@/lib/blog-content";
import { BOOKING_URL } from "@/lib/content";
import { getAllBlogSlugs, getBlogPost } from "@/lib/blog-posts";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const Content = getBlogContent(slug);
  if (!post || !Content) notFound();

  const relatedPosts =
    post.relatedSlugs
      ?.map((relatedSlug) => getBlogPost(relatedSlug))
      .filter((related): related is NonNullable<typeof related> => Boolean(related)) ?? [];

  return (
    <>
      <article className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Blog</SectionLabel>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
            {post.title}
          </h1>
          <time
            dateTime={post.publishedAt}
            className="mt-4 block text-sm text-charcoal/60"
          >
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>

          <div className="prose-barber mt-10 space-y-6 text-charcoal/80">
            <Content />
          </div>

          <div className="mt-12 flex flex-col items-start gap-4 border-t border-charcoal/10 pt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href={BOOKING_URL} external>
              Book Your Appointment
            </Button>
            <Button href="/services" variant="outline">
              View Our Services
            </Button>
            <Link href="/blog" className="text-sm font-medium text-charcoal/70 hover:text-charcoal">
              Back to Blog
            </Link>
          </div>

          {relatedPosts.length > 0 && (
            <aside className="mt-10 border-t border-charcoal/10 pt-8">
              <h2 className="font-serif text-xl font-semibold text-charcoal">Related reading</h2>
              <ul className="mt-4 space-y-2">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="text-sm font-medium text-brass-dark hover:text-brass"
                    >
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}
