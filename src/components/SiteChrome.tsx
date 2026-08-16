"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { BookingChatbot } from "@/components/BookingChatbot";
import { EditModeRoot } from "@/components/EditModeRoot";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroSplash } from "@/components/IntroSplash";
import { StickyBookButton } from "@/components/StickyBookButton";
import { isHubPath } from "@/lib/hub";
import type { SiteContent } from "@/lib/site-content-types";

type SiteChromeProps = {
  children: React.ReactNode;
  labels: SiteContent["HEADER"];
  content: SiteContent;
  adminAuthenticated: boolean;
  editModeEnabled: boolean;
};

export function SiteChrome({
  children,
  labels,
  content,
  adminAuthenticated,
  editModeEnabled,
}: SiteChromeProps) {
  const pathname = usePathname();

  if (isHubPath(pathname)) {
    return (
      <Suspense fallback={null}>
        <AnalyticsTracker />
        <main id="main-content" tabIndex={-1} className="min-h-dvh bg-bone">
          {children}
        </main>
      </Suspense>
    );
  }

  return (
    <>
      <IntroSplash />
      <Suspense fallback={null}>
        <AnalyticsTracker />
        <EditModeRoot cookieEnabled={editModeEnabled} adminAuthenticated={adminAuthenticated}>
          <div className="pb-20 md:pb-0">
            <Header labels={labels} />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Footer content={content} adminAuthenticated={adminAuthenticated} />
            <StickyBookButton />
            <BookingChatbot />
          </div>
        </EditModeRoot>
      </Suspense>
    </>
  );
}
