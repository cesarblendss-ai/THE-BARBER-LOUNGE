import type { Metadata } from "next";

import { BOOKING_URL, SITE } from "./content";

export type LandingFaq = { question: string; answer: string };

export type LandingPageConfig = {
  slug: string;
  path: string;
  meta: { title: string; description: string };
  eyebrow: string;
  headline: string;
  subheadline: string;
  bullets: string[];
  faqs: LandingFaq[];
  cta: { label: string; href: string; external?: boolean };
  secondaryCta?: { label: string; href: string; external?: boolean };
  relatedBlog?: { label: string; href: string };
};

export const KIDS_CUTS_PAGE: LandingPageConfig = {
  slug: "kids-cuts",
  path: "/kids-cuts",
  meta: {
    title: "Kids Haircuts in Antioch, CA — The Barber Lounge",
    description:
      "Kid-friendly haircuts and fades in Antioch. Patient barbers, fade vs taper guidance, and a calm chair at The Barber Lounge. Book today.",
  },
  eyebrow: "KIDS HAIRCUTS · ANTIOCH",
  headline: "Kid-Friendly Cuts That Look Sharp",
  subheadline:
    "Whether it's a first fade or a back-to-school taper, our barbers take time to explain the cut, keep the chair calm, and send your kid out looking fresh.",
  bullets: [
    "Fade vs taper — we walk you through what works for your child's hair",
    "Maintenance tips between visits so the cut lasts longer",
    "Kid-friendly shop with on-site parking",
    "Book online or call (925) 209-5995",
  ],
  faqs: [
    {
      question: "What age do you recommend for a fade?",
      answer:
        "Every child is different. We consult with parents first and start with styles that match hair type and maintenance you're comfortable with.",
    },
    {
      question: "How often should kids get haircuts?",
      answer: "Most fades look best with a touch-up every 2–3 weeks. Tapers can stretch a bit longer between visits.",
    },
  ],
  cta: { label: "Book a Kids Cut", href: BOOKING_URL, external: true },
  secondaryCta: {
    label: "Read: Maintain Your Fade",
    href: "/blog/maintain-your-fade-kids-haircut-antioch",
  },
};

export const BEARD_STUDIO_PAGE: LandingPageConfig = {
  slug: "beard-studio",
  path: "/beard-studio",
  meta: {
    title: "Beard Trim & Grooming in Antioch — The Barber Lounge",
    description:
      "Expert beard trims and line-ups in Antioch. Pair with a signature cut for a finished look. The Barber Lounge — book online.",
  },
  eyebrow: "BEARD TRIM · LINE-UP · GROOMING",
  headline: "Beard Work That Completes the Cut",
  subheadline:
    "A fresh fade deserves a clean beard line. Our barbers shape, trim, and finish with the same precision we bring to every signature service.",
  bullets: [
    "Signature Haircut & Beard — $65 · full grooming in one visit",
    "Clean line-ups and beard shaping",
    "Hot Lather Finish on signature services",
    "Regular trims keep your look sharp between haircuts",
  ],
  faqs: [
    {
      question: "How often should I get a beard trim?",
      answer:
        "Most clients sync beard trims with haircuts — every 2–3 weeks keeps lines clean and growth even.",
    },
    {
      question: "Beard only, or haircut too?",
      answer: "Both. Book Signature Haircut & Beard for the full package, or ask your barber for a trim add-on.",
    },
  ],
  cta: { label: "Book Haircut & Beard", href: BOOKING_URL, external: true },
  secondaryCta: { label: "Full Service Menu", href: "/services" },
  relatedBlog: {
    label: "Why beard trim matters",
    href: "/blog/beard-trim-antioch-grooming",
  },
};
