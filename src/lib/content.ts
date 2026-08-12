// The Barber Lounge — Site Content

import { SITE_URL } from "./constants";

export const BOOKING_URL =
  "https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch";

/** Paste "Write a review" link from Google Business Profile → Share → Ask for reviews */
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=The+Barber+Lounge+1518+A+St+Antioch+CA";

export const SITE = {
  name: "The Barber Lounge",
  address: "1518 A St, Antioch, CA 94509",
  phone: "(925) 209-5995",
  phoneTel: "+19252095995",
  email: "thebarberlounge00@gmail.com",
  instagram: "@thebarberlounges1",
  instagramUrl: "https://www.instagram.com/thebarberlounges1/",
  rating: 5.0,
  reviewCount: 180,
};

export const HOURS = [
  { day: "Sunday", hours: "8:00 AM – 7:00 PM" },
  { day: "Monday", hours: "10:00 AM – 7:00 PM" },
  { day: "Tuesday", hours: "Closed" },
  { day: "Wednesday", hours: "9:00 AM – 7:00 PM" },
  { day: "Thursday", hours: "9:00 AM – 7:00 PM" },
  { day: "Friday", hours: "9:00 AM – 7:00 PM" },
  { day: "Saturday", hours: "8:00 AM – 7:00 PM" },
];

// ============================= HOMEPAGE =============================

export const HOME = {
  hero: {
    eyebrow: "ANTIOCH'S PREMIER BARBERSHOP EXPERIENCE",
    headline: "Sharp Cuts. Real Craftsmanship. Zero Compromise.",
    subheadline:
      "Precision fades, clean tapers, and modern styles — delivered by barbers who treat every chair like it's their reputation on the line.",
    ctaPrimary: { label: "Book Your Appointment", href: BOOKING_URL },
    ctaSecondary: { label: "See Our Work", href: SITE.instagramUrl },
    trustBar: `${SITE.rating}★ rating · ${SITE.reviewCount}+ five-star reviews · ${SITE.address}`,
  },
  valueProps: [
    {
      title: "Precision, Every Time",
      body: "Every Signature service includes a full consultation, precision cutting, styling, and a Hot Lather Finish.",
    },
    {
      title: "A Standard, Not a Trend",
      body: "A modern barbershop experience built on precision, attention to detail, and professional service.",
    },
    {
      title: "Clean Shop, Clean Cuts",
      body: "A comfortable, upscale space with on-site parking, Wi-Fi, and a kid-friendly welcome.",
    },
    {
      title: "Barbers Who Show Up",
      body: "A team of specialists in fades, tapers, and beard work, each with their own following of repeat clients.",
    },
  ],
  featuredServices: [
    { name: "Signature Haircut", price: "$50", time: "1 hr" },
    { name: "Signature Haircut & Beard", price: "$65", time: "1 hr" },
    // TODO: add remaining services (kids' cuts, beard trims, hot towel shave, etc.)
  ],
  aboutTeaser: {
    headline: "More Than a Haircut.",
    body: "The Barber Lounge was built to give Antioch a barbershop where precision, consistency, and professional service come standard. Every chair runs on the same process — real consultation, careful cutting, and a finish you're proud to walk out with.",
    cta: { label: "Meet the Team", href: "/about" },
  },
  finalCta: {
    headline: "Your Next Great Haircut Is One Click Away.",
    cta: { label: "Book Now", href: BOOKING_URL },
  },
};

// ============================= ABOUT =============================

export type TeamMember = {
  name: string;
  /** Instagram username only — lowercase, no @, no spaces */
  handle: string | null;
};

export function instagramProfileUrl(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "").trim()}/`;
}

export const ABOUT = {
  team: [
    { name: "Alexis Franco", handle: "lexblendzz" },
    { name: "Braulio Gómez", handle: "925.liocutz" },
    { name: "Cesar Silva", handle: "cesarblends" },
    { name: "Kristian Guerra", handle: "mr.icylinez" },
    { name: "Jose Fuentes", handle: "jfenz_" },
    { name: "Sebastian Guardado", handle: "blendz_bysebas" },
  ] satisfies TeamMember[],
};

// ============================= SERVICES =============================

export const SERVICES = {
  hero: {
    headline: "Every Cut. Every Detail. Done Right.",
    subheadline:
      "From signature cuts to sharp beard work, every service includes a full consultation so you leave looking exactly how you pictured it.",
  },
  list: [
    {
      name: "Signature Haircut",
      price: "$50",
      time: "1 hr",
      description: "Consultation, precision cutting, styling, Hot Lather Finish",
    },
    {
      name: "Signature Haircut & Beard",
      price: "$65",
      time: "1 hr",
      description: "Consultation, Hot Towel, precision cutting, styling, Hot Lather Finish",
    },
    // Draft rows — rename/remove brackets in content.ts when pricing is confirmed:
    { name: "[Kids Haircut]", price: "[$__]", time: "[__ min]", description: "[Placeholder — confirm pricing]" },
    {
      name: "[Beard Trim & Line-Up]",
      price: "[$__]",
      time: "[__ min]",
      description: "[Placeholder — confirm pricing]",
    },
    { name: "[Hot Towel Shave]", price: "[$__]", time: "[__ min]", description: "[Placeholder — confirm pricing]" },
  ],
  addOns:
    "Ask your barber about add-ons such as hair design, eyebrow cleanup, or hot towel upgrades at your appointment.",
  note: "Pricing for Signature Haircut and Signature Haircut & Beard reflects current Booksy listings. Additional services will be added as menu details are confirmed.",
  cta: { label: "Book Your Service", href: BOOKING_URL },
};

/** Bracket-prefixed rows in SERVICES.list are drafts — hidden from public pages. */
export function isPublishedService(name: string): boolean {
  return !name.startsWith("[");
}

export function getPublishedServices() {
  return SERVICES.list.filter((service) => isPublishedService(service.name));
}

// ============================= FAQ =============================

export const FAQ = [
  {
    q: "Do I need an appointment, or do you take walk-ins?",
    a: "Appointments are recommended and easiest to book online. Walk-ins are welcome when a chair is open — call ahead on busy days to check availability.",
  },
  {
    q: "How do I book an appointment?",
    a: `Book online anytime through our booking page, or reach us at ${SITE.phone}.`,
  },
  {
    q: "What forms of payment do you accept?",
    a: "We accept credit cards and cash.",
  },
  {
    q: "Is The Barber Lounge kid-friendly?",
    a: "Yes — we welcome clients of all ages in a clean, comfortable shop.",
  },
  {
    q: "What if I need to cancel or reschedule?",
    a: "Please reschedule or cancel at least 24 hours ahead when possible. Late cancellations or no-shows may affect future booking availability.",
  },
  {
    q: "Do you offer beard grooming and hot towel shaves?",
    a: "Yes — every Signature Haircut & Beard service includes a hot towel and precision beard work.",
  },
  {
    q: "Is parking available?",
    a: "Yes, on-site parking is available.",
  },
  {
    q: "Can I request a specific barber?",
    a: "Absolutely — choose your barber when you book online, or ask us for a recommendation.",
  },
  {
    q: "Where are you located?",
    a: SITE.address,
  },
  {
    q: "What are your hours?",
    a: HOURS.map((h) => `${h.day} ${h.hours}`).join(" · "),
  },
];

// ============================= TESTIMONIALS =============================

export const TESTIMONIALS = {
  hero: {
    headline: "Don't Just Take Our Word For It.",
    subheadline: `${SITE.reviewCount}+ five-star reviews and counting.`,
  },
  quotes: [
    {
      quote:
        "Braulio is an amazing barber! Always gives a clean, consistent cut and pays attention to every detail. Great service and a great experience every time. Highly recommend asking for Braulio!",
      attribution: "Mir Asim · $50-60",
    },
    {
      quote:
        "Braulio did an excellent job on my mid fade haircut. The fade came out clean, sharp, and exactly how I wanted it.",
      attribution: "Jhojan Zelaya · $50-60",
    },
    {
      quote:
        "Braulio's a great dude and an amazing barber. He's really skilled and pays attention to detail. He's also very accommodating with appointments",
      attribution: "Dominique Gomez · $50-60",
    },
    {
      quote:
        "Followed Lex over here when he opened this shop. All the barbers here do incredible work and what I really appreciate is...",
      attribution: "Anthony Velázquez",
    },
    {
      quote:
        "Great barbershop. Clean spot, chill vibe, and they really take their time with your cut. Left with exactly what I wanted definitely coming back. I personally recommend lex the barber he'll get you right!!!!",
      attribution: "Diego Elias",
    },
    {
      quote:
        "Ive been going with Alexis for a little over 7 years now and i can say every time he's got me right. We always have a great time. I truly can't see myself going to another barber",
      attribution: "gerardo delgadillo · $50-60",
    },
    {
      quote:
        "Alexis, Cesar and all the boys did an amazing job. Really take their time to welcome us and get us right.",
      attribution: "Jesus Cruz · $60-70",
    },
    {
      quote:
        "10/10 experience. Alexis and Cesar are professional, respectful, and communicative. Great vibe, great service, and great young entrepreneurs. I highly recommend this spot to any future clients",
      attribution: "Jose Sandoval",
    },
    {
      quote:
        "Great Service and beautiful place they got going on haircut came out clean Barber Cesar never disappoints",
      attribution: "Luis Salgado Carlon · $50-60",
    },
    {
      quote:
        "Sebastián the barber is very professional and left me looking real fresh, 11/10 will recommend getting cut by him, great hospitality and very respectful also gave me a free water!",
      attribution: "Alex Jones · $50-60",
    },
    {
      quote:
        "Sebastian hooked it up with a perfect haircut, on time and easy to book. I highly recommend this place.",
      attribution: "Alexander Velazquez · $50-60",
    },
    {
      quote:
        "Great place with good vibes the inside is super nice and my barber Sebass gets me right every single time.",
      attribution: "Matt T · $40-50",
    },
    {
      quote:
        "I called today at 12 pm if they had any appointments for a toddler. He was able to get me within the next hour.",
      attribution: "Kimberly Sanchez · $50-60",
    },
    {
      quote:
        "Very professional not only do you get a haircut but you get a whole experience with hot lather plus towel first barbershop that does this and I highly recommend",
      attribution: "Mannie925",
    },
    {
      quote:
        "This barber was clean, professional, and cut my son's hair so nice. Didn't take forever at all, and my son was very happy with his cut. Now he's ready for his first day of school.",
      attribution: "Kristyna, Signature Haircut",
    },
  ],
  cta: { label: "Ready to Join Them? Book Now", href: BOOKING_URL },
};

// ============================= CONTACT =============================

export const CONTACT = {
  hero: {
    headline: "Let's Get You Booked.",
    subheadline: "Walk in, call, or book online — however you reach us, we'll get you in the chair.",
  },
  address: SITE.address,
  hours: HOURS,
  phone: SITE.phone,
  email: SITE.email,
  instagram: SITE.instagram,
  formFields: ["Name", "Phone", "Email", "Preferred Barber", "Message"],
  cta: { label: "Book Your Appointment", href: BOOKING_URL },
};

// ============================= SEO / LOCAL BUSINESS SCHEMA =============================

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BarberShop",
  name: SITE.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: "1518 A St",
    addressLocality: "Antioch",
    addressRegion: "CA",
    postalCode: "94509",
    addressCountry: "US",
  },
  telephone: SITE.phoneTel,
  email: SITE.email,
  image: `${SITE_URL}/logo.png`,
  priceRange: "$$",
  areaServed: [
    { "@type": "City", name: "Antioch", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Pittsburg", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Brentwood", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Oakley", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Bay Point", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Discovery Bay", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Concord", containedInPlace: { "@type": "State", name: "California" } },
    { "@type": "City", name: "Martinez", containedInPlace: { "@type": "State", name: "California" } },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: SITE.rating,
    reviewCount: SITE.reviewCount,
  },
  openingHoursSpecification: HOURS.filter((h) => h.hours !== "Closed").map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.day,
    opens: h.hours.split(" – ")[0],
    closes: h.hours.split(" – ")[1],
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Barber Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Signature Haircut",
          description: "Precision haircut tailored to your style.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Signature Haircut & Beard",
          description: "Full grooming service including haircut and beard trim.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kids Haircut",
          description: "Fun and friendly haircut for children.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Fade",
          description: "Stylish fade haircut for a fresh look.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Line Up",
          description: "Sharpen up your edges for a clean finish.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Beard Trim",
          description: "Expert beard trimming and shaping.",
        },
      },
    ],
  },
  sameAs: [SITE.instagramUrl],
};
