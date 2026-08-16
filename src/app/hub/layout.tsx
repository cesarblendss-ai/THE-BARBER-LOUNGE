import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { HubLogin } from "@/components/HubLogin";
import { HubShell } from "@/components/HubShell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
  manifest: "/hub-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Cesar’s Hub",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const unlocked = isAdminAuthenticated(cookieStore);

  if (!unlocked) {
    return <HubLogin />;
  }

  return <HubShell>{children}</HubShell>;
}
