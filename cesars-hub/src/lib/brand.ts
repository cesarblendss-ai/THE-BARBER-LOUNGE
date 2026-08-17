export const HUB = {
  name: "Cesar’s Hub",
  owner: "Cesar Blends",
  phone: "(925) 209-5995",
  phoneTel: "+19252095995",
} as const;

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:8743";
}
