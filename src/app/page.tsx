import { permanentRedirect } from "next/navigation";

/**
 * Cesar (2026-11): Tim `/book` funnel IS the website.
 * Root redirects to the book experience — no cinematic / Halloween homepage.
 */
export default function HomePage() {
  permanentRedirect("/book");
}
