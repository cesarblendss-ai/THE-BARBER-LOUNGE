export const HUB_PATH = "/";

/** Bookmark this. Local shop OS — not The Barber Lounge website. */
export const HUB_LIVE_URL = "http://localhost:8743/?biz=barber-lounge&production=1";

export const HUB_GITHUB_URL = "https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE";

export const HUB_VERCEL_URL =
  "https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge";

export const HUB_DEAD_HOSTS = ["thebarberlounge.com", "the-barber-lounge.vercel.app"] as const;

export const HUB_SECTION_CLASS = "bg-bone px-4 pb-28 pt-6 sm:px-6 sm:pb-16";

export const HUB_NAV = [
  { href: "/", label: "Home", match: "exact" as const },
  { href: "/estimates", label: "Estimates", match: "prefix" as const },
  { href: "/calendar", label: "Week", match: "prefix" as const },
  { href: "/products", label: "Retail", match: "prefix" as const },
  { href: "/manual", label: "Manual", match: "prefix" as const },
] as const;

export function isHubPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/e" || pathname.startsWith("/e/")) return false;
  if (pathname.startsWith("/api/")) return false;
  return true;
}
