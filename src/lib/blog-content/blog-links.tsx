import Link from "next/link";

import { BOOKING_URL, SITE } from "@/lib/content";

const linkClass = "font-medium text-brass-dark underline-offset-2 hover:underline";

export function ServicesLink({ children }: { children?: React.ReactNode }) {
  return (
    <Link href="/services" className={linkClass}>
      {children ?? "our services"}
    </Link>
  );
}

export function BookOnlineLink({ children }: { children?: React.ReactNode }) {
  return (
    <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children ?? "book online"}
    </a>
  );
}

export function PhoneLink({ children }: { children?: React.ReactNode }) {
  return (
    <a href={`tel:${SITE.phoneTel}`} className={linkClass}>
      {children ?? SITE.phone}
    </a>
  );
}

export function BlogPostLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link href={`/blog/${slug}`} className={linkClass}>
      {children}
    </Link>
  );
}
