import { DAY_NAMES, displayDayForDate } from "@/lib/booking-agent/format";
import { HOURS } from "@/lib/content";

export const WIZARD_SERVICES = [
  { id: "regular", label: "Regular haircut" },
  { id: "haircut-beard", label: "Haircut & beard" },
] as const;

export type BookableDay = {
  date: string;
  dayName: string;
  label: string;
};

function isDayOpen(dayName: string): boolean {
  const entry = HOURS.find((h) => h.day === dayName);
  return entry !== undefined && entry.hours !== "Closed";
}

function toDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Next N open business days starting tomorrow (skips closed days like Tuesday). */
export function getNextBookableDays(count = 3, fromDate: Date = new Date()): BookableDay[] {
  const days: BookableDay[] = [];
  const cursor = new Date(fromDate);
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  let safety = 0;
  while (days.length < count && safety < 21) {
    safety += 1;
    const dayName = DAY_NAMES[cursor.getDay()];
    if (isDayOpen(dayName)) {
      const date = toDateStr(cursor);
      const month = cursor.toLocaleDateString("en-US", { month: "short" });
      days.push({
        date,
        dayName,
        label: `${dayName} · ${month} ${cursor.getDate()}`,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function dayLabelForDate(dateStr: string, reference: Date = new Date()): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return displayDayForDate(new Date(y, m - 1, d, 12), reference);
}
