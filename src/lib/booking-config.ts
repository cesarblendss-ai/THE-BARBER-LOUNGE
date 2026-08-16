import { BOOKABLE_SERVICES, HOURS, SITE } from "@/lib/content";
import type { BookingAgentConfig } from "@/lib/booking-agent/types";

/** Site-specific booking agent configuration for The Barber Lounge. */
export const BARBER_LOUNGE_CONFIG: BookingAgentConfig = {
  businessName: SITE.name,
  address: SITE.address,
  phone: SITE.phone,
  timezone: "America/Los_Angeles",
  hours: HOURS,
  services: BOOKABLE_SERVICES,
  tone:
    "Short, friendly, human — like a barber shop front desk in Antioch. Never corporate.",
};
