import { HOURS, SERVICES, SITE } from "@/lib/content";
import type { BookingAgentConfig } from "@/lib/booking-agent/types";

/** Site-specific booking agent configuration for The Barber Lounge. */
export const BARBER_LOUNGE_CONFIG: BookingAgentConfig = {
  businessName: SITE.name,
  address: SITE.address,
  phone: SITE.phone,
  timezone: "America/Los_Angeles",
  hours: HOURS,
  services: SERVICES.list.filter((s) => !s.name.startsWith("[")),
  extraServiceNames: [
    "Kids Haircut",
    "Beard Trim & Line-Up",
    "Hot Towel Shave",
  ],
  tone:
    "Short, friendly, human — like a barber shop front desk in Antioch. Never corporate.",
  notificationTopic: "the-barber-lounge-bookings",
};
