import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { HUB } from "@/lib/brand";
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
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export const metadata: Metadata = {
  title: {
    default: HUB.name,
    template: `%s | ${HUB.name}`,
  },
  description: "Estimates, e-sign, and deposits. Separate from The Barber Lounge website.",
  robots: { index: false, follow: false },
  manifest: "/hub-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: HUB.name,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-bone font-sans text-charcoal">{children}</body>
    </html>
  );
}
