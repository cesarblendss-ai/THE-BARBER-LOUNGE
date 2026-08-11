export {
  createAvailabilityEngine,
  parseTimeString,
} from "@/lib/booking-agent/availability";
export {
  displayDayForDate,
  formatDisplayTime,
  formatSlotSuggestion as formatSlotLabel,
} from "@/lib/booking-agent/format";
export type { ParsedSlot, AvailabilityResult } from "@/lib/booking-agent/types";

import { BARBER_LOUNGE_CONFIG } from "@/lib/booking-config";
import { createAvailabilityEngine } from "@/lib/booking-agent/availability";

const engine = createAvailabilityEngine(BARBER_LOUNGE_CONFIG.hours);

export const parsePreferredSlot = engine.parsePreferredSlot;
export const generateSlotsForDate = engine.generateSlotsForDate;
export const isHourWithinBusinessHours = engine.isHourWithinBusinessHours;
export const slotKey = engine.slotKey;
