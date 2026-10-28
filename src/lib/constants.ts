export const LOGO = {
  src: "/logo.png?v=3",
  alt: "The Barber Lounge",
  width: 1000,
  height: 329,
} as const;

// TODO: Replace with confirmed coordinates before launch
export const GEO = {
  latitude: 38.0049,
  longitude: -121.8058,
};

// Primary public host (verified on Vercel). thebarberlounge.com is still DNS-parked.
export const SITE_URL = "https://thebarberloungeca.com";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
