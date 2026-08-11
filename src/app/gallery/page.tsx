import { redirect } from "next/navigation";

import { BOOKING_URL } from "@/lib/content";

/** Public gallery removed — send visitors straight to booking. */
export default function GalleryPage() {
  redirect(BOOKING_URL);
}
