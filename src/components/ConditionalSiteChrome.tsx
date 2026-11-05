"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BookingChatbot } from "@/components/BookingChatbot";
import { Footer } from "@/components/Footer";
import { HalloweenDecor } from "@/components/HalloweenDecor";
import { Header } from "@/components/Header";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { StickyBookButton } from "@/components/StickyBookButton";
import type { SiteContent } from "@/lib/site-content-types";

type ConditionalSiteChromeProps = {
  labels: SiteContent["HEADER"];
  content: SiteContent;
  adminAuthenticated: boolean;
  children: ReactNode;
};

/** Hides global Halloween chrome / FAB / sticky bar on Tim Cho `/book` UI. */
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
    return () => document.body.classList.remove("tim-book-route");
  }, [isBookRoute]);

  if (isBookRoute) {
    return (
      <main id="main-content" tabIndex={-1} className="relative z-10">
        {children}
      </main>
    );
  }

  return (
    <>
      <HalloweenDecor />
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
    </>
  );
}
