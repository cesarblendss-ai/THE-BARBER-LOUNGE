"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BookingChatbot } from "@/components/BookingChatbot";
import { ChristmasLights } from "@/components/ChristmasLights";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { StickyBookButton } from "@/components/StickyBookButton";
import type { SiteContent } from "@/lib/site-content-types";

type ConditionalSiteChromeProps = {
  labels: SiteContent["HEADER"];
  content: SiteContent;
  adminAuthenticated: boolean;
  children: ReactNode;
};

/** Public chrome — Christmas holiday theme site-wide (lights + holly/pine accents). */
export function ConditionalSiteChrome({
  labels,
  content,
  adminAuthenticated,
  children,
}: ConditionalSiteChromeProps) {
  const pathname = usePathname();
  const isBookRoute = pathname === "/book" || pathname.startsWith("/book/");

  useEffect(() => {
    document.body.classList.toggle("tim-book-route", isBookRoute);
    document.body.classList.add("holiday-theme");
    return () => {
      document.body.classList.remove("tim-book-route");
      document.body.classList.remove("holiday-theme");
    };
  }, [isBookRoute]);

  if (isBookRoute) {
    return (
      <LanguageProvider>
        <div className="relative">
          <ChristmasLights />
          <main id="main-content" tabIndex={-1} className="relative z-10">
            {children}
          </main>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="relative">
        <ChristmasLights />
        <Header labels={labels} />
        <main id="main-content" tabIndex={-1} className="relative z-10">
          {children}
        </main>
        <div className="relative z-10">
          <Footer content={content} adminAuthenticated={adminAuthenticated} />
        </div>
        <StickyBookButton />
        <LeadCaptureModal />
        <BookingChatbot />
      </div>
    </LanguageProvider>
  );
}
