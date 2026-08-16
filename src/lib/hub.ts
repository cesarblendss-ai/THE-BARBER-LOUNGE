export const HUB_PATH = "/hub";

/** Bookmark this. Works without Cursor. Prefer the Antioch alias until DNS is fixed. */
export const HUB_LIVE_URL = "https://the-barber-lounge-antioch.vercel.app/hub";

export const HUB_GITHUB_URL = "https://github.com/cesarblendss-ai/THE-BARBER-LOUNGE";

export const HUB_VERCEL_URL =
  "https://vercel.com/cesarblendss-7234s-projects/the-barber-lounge";

/** Do not bookmark these until NameBright DNS is live. */
export const HUB_DEAD_HOSTS = ["thebarberlounge.com", "the-barber-lounge.vercel.app"] as const;

export const HUB_SECTION_CLASS = "bg-bone px-4 pb-28 pt-6 sm:px-6 sm:pb-16";

export const HUB_NAV = [
  { href: "/hub", label: "Home", match: "exact" as const },
  { href: "/hub/calendar", label: "Week", match: "prefix" as const },
  { href: "/hub/appointments", label: "Books", match: "prefix" as const },
  { href: "/hub/products", label: "Retail", match: "prefix" as const },
  { href: "/hub/manual", label: "Manual", match: "prefix" as const },
] as const;

export function isHubPath(pathname: string | null): boolean {
  return pathname === "/hub" || Boolean(pathname?.startsWith("/hub/"));
}
