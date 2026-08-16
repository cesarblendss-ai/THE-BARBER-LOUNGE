import type { Metadata } from "next";
import { cookies } from "next/headers";

import { HubLogin } from "@/components/HubLogin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Cesar’s Hub — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const unlocked = isAdminAuthenticated(cookieStore);

  if (!unlocked) {
    return <HubLogin />;
  }

  return <>{children}</>;
}
