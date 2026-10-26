import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HalloweenDecor } from "@/components/HalloweenDecor";
import { BookingChatbot } from "@/components/BookingChatbot";
import { EditModeRoot } from "@/components/EditModeRoot";
import { StickyBookButton } from "@/components/StickyBookButton";
import { EDIT_MODE_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/get-site-content";
import { buildLocalBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "The Barber Lounge | Barbershop Antioch CA",
    template: "%s | The Barber Lounge",
  },
  description:
    "Premium barbershop in Antioch, CA. Precision fades, signature haircuts, and beard grooming. Book your appointment at The Barber Lounge on A St.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildLocalBusinessJsonLd();
  const content = await getSiteContent();
  const cookieStore = await cookies();
  const adminAuthenticated = isAdminAuthenticated(cookieStore);
  const editModeEnabled =
    adminAuthenticated && cookieStore.get(EDIT_MODE_COOKIE)?.value === "1";

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-black font-sans text-white pb-20 md:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Suspense fallback={null}>
          <AnalyticsTracker />
          <EditModeRoot cookieEnabled={editModeEnabled} adminAuthenticated={adminAuthenticated}>
            <HalloweenDecor />
            <Header labels={content.HEADER} />
            <main id="main-content" tabIndex={-1} className="relative z-10">
              {children}
            </main>
            <div className="relative z-10">
              <Footer content={content} adminAuthenticated={adminAuthenticated} />
            </div>
            <StickyBookButton />
            <BookingChatbot />
          </EditModeRoot>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
