import {
  DAY_NAMES,
  displayDayForDate,
  formatDisplayTime,
  formatSlotSuggestion,
} from "@/lib/booking-agent/format";
import type { AvailabilityResult, HoursEntry, ParsedSlot } from "@/lib/booking-agent/types";

type DayHours = { openHour: number; closeHour: number } | null;

type SlotStore = {
  isSlotTaken: (date: string, hour: number) => boolean;
};

function parseHourToken(token: string): number | null {
  const normalized = token.trim().toLowerCase().replace(/\./g, "");
  if (normalized === "noon") return 12;
  if (normalized === "midnight") return 0;
  if (normalized === "morning") return 10;
  if (normalized === "afternoon") return 14;
  if (normalized === "evening") return 17;

  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3];

  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && hour <= 7) hour += 12;

  if (minutes >= 30) hour += 1;
  return hour;
}

export function parseTimeString(timeStr: string): number | null {
  const text = timeStr.trim().toLowerCase();
  const relative = text.match(/^(after|before|around|by)\s+(.+)$/);
  const target = relative?.[2] ?? text;
  return parseHourToken(target.replace(/\s+/g, " "));
}

function getDayHours(hours: HoursEntry[], dayName: string): DayHours {
  const entry = hours.find((h) => h.day.toLowerCase() === dayName.toLowerCase());
  if (!entry || entry.hours === "Closed") return null;

  const [openRaw, closeRaw] = entry.hours.split(" – ");
  const openHour = parseHourToken(openRaw);
  const closeHour = parseHourToken(closeRaw);
  if (openHour === null || closeHour === null) return null;
  return { openHour, closeHour };
}

function resolveDayName(
  dayStr: string,
  reference: Date,
): { date: Date; displayDay: string } | null {
  const text = dayStr.trim().toLowerCase();
  const ref = new Date(reference);
  ref.setHours(12, 0, 0, 0);

  if (text === "today") {
    return { date: ref, displayDay: "Today" };
  }

  if (text === "tomorrow") {
    const d = new Date(ref);
    d.setDate(d.getDate() + 1);
    return { date: d, displayDay: "Tomorrow" };
  }

  const thisMatch = text.match(/^this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  const nextMatch = text.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  const plainMatch = text.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);

  let targetDay: string | null = null;
  let forceNextWeek = false;

  if (thisMatch) targetDay = thisMatch[1];
  else if (nextMatch) {
    targetDay = nextMatch[1];
    forceNextWeek = true;
  } else if (plainMatch) targetDay = plainMatch[1];

  if (!targetDay) return null;

  const targetIndex = DAY_NAMES.findIndex((d) => d.toLowerCase() === targetDay);
  if (targetIndex < 0) return null;

  const currentIndex = ref.getDay();
  let daysAhead = (targetIndex - currentIndex + 7) % 7;
  if (forceNextWeek && daysAhead === 0) daysAhead = 7;

  const result = new Date(ref);
  result.setDate(result.getDate() + daysAhead);

  const displayDay =
    daysAhead === 0 && !forceNextWeek
      ? "Today"
      : daysAhead === 1
        ? "Tomorrow"
        : displayDayForDate(result, ref);

  return { date: result, displayDay };
}

export function createAvailabilityEngine(hours: HoursEntry[]) {
  function isHourWithinBusinessHours(dayName: string, hour: number): boolean {
    const dayHours = getDayHours(hours, dayName);
    if (!dayHours) return false;
    return hour >= dayHours.openHour && hour < dayHours.closeHour;
  }

  function parsePreferredSlot(
    preferredDay: string,
    preferredTime: string,
    referenceDate: Date = new Date(),
  ): ParsedSlot | null {
    const dayResolved = resolveDayName(preferredDay, referenceDate);
    const hour = parseTimeString(preferredTime);
    if (!dayResolved || hour === null) return null;

    const dayName = DAY_NAMES[dayResolved.date.getDay()];
    if (!isHourWithinBusinessHours(dayName, hour)) return null;

    const yyyy = dayResolved.date.getFullYear();
    const mm = String(dayResolved.date.getMonth() + 1).padStart(2, "0");
    const dd = String(dayResolved.date.getDate()).padStart(2, "0");

    return {
      date: `${yyyy}-${mm}-${dd}`,
      hour,
      displayDay: dayResolved.displayDay,
      displayTime: formatDisplayTime(hour),
    };
  }

  function generateSlotsForDate(dateStr: string, referenceDate: Date = new Date()): ParsedSlot[] {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12);
    const dayName = DAY_NAMES[date.getDay()];
    const dayHours = getDayHours(hours, dayName);
    if (!dayHours) return [];

    const slots: ParsedSlot[] = [];
    for (let hour = dayHours.openHour; hour < dayHours.closeHour; hour++) {
      slots.push({
        date: dateStr,
        hour,
        displayDay: displayDayForDate(date, referenceDate),
        displayTime: formatDisplayTime(hour),
      });
    }
    return slots;
  }

  function slotKey(date: string, hour: number): string {
    return `${date}T${String(hour).padStart(2, "0")}`;
  }

  function findAlternatives(
    store: SlotStore,
    fromSlot: ParsedSlot,
    count = 3,
    referenceDate: Date = new Date(),
  ): ParsedSlot[] {
    const alternatives: ParsedSlot[] = [];
    const [y, m, d] = fromSlot.date.split("-").map(Number);
    const start = new Date(y, m - 1, d, 12);

    for (let dayOffset = 0; dayOffset < 14 && alternatives.length < count; dayOffset++) {
      const date = new Date(start);
      date.setDate(start.getDate() + dayOffset);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const slots = generateSlotsForDate(dateStr, referenceDate);
      for (const slot of slots) {
        if (dayOffset === 0 && slot.hour <= fromSlot.hour) continue;
        if (!store.isSlotTaken(slot.date, slot.hour)) {
          alternatives.push({
            ...slot,
            displayDay: displayDayForDate(date, referenceDate),
            displayTime: slot.displayTime,
          });
          if (alternatives.length >= count) break;
        }
      }
    }

    return alternatives;
  }

  function checkAvailabilityWithStore(
    store: SlotStore,
    preferredDay: string,
    preferredTime: string,
    referenceDate: Date = new Date(),
  ): AvailabilityResult {
    const slot = parsePreferredSlot(preferredDay, preferredTime, referenceDate);
    if (!slot) {
      const today = new Date(referenceDate);
      today.setHours(12, 0, 0, 0);
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const seedSlot: ParsedSlot = {
        date: `${yyyy}-${mm}-${dd}`,
        hour: 9,
        displayDay: displayDayForDate(today, referenceDate),
        displayTime: "9:00 AM",
      };

      return {
        available: false,
        slot: null,
        reason: "closed_or_invalid",
        alternatives: findAlternatives(store, seedSlot, 3, referenceDate),
      };
    }

    if (store.isSlotTaken(slot.date, slot.hour)) {
      return {
        available: false,
        slot,
        reason: "booked",
        alternatives: findAlternatives(store, slot, 3, referenceDate),
      };
    }

    return { available: true, slot };
  }

  return {
    parsePreferredSlot,
    generateSlotsForDate,
    findAlternatives,
    checkAvailabilityWithStore,
    slotKey,
    isHourWithinBusinessHours,
    formatSlotLabel: (slot: ParsedSlot) => formatSlotSuggestion(slot, new Date()),
  };
}

export type AvailabilityEngine = ReturnType<typeof createAvailabilityEngine>;
