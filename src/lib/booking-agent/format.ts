const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Human-readable day label — never returns null/undefined. */
export function displayDayForDate(date: Date, reference: Date = new Date()): string {
  const ref = startOfDay(reference);
  const target = startOfDay(date);
  const diffDays = Math.round((target.getTime() - ref.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  const dayName = DAY_NAMES[target.getDay()];
  const month = target.toLocaleDateString("en-US", { month: "short" });
  const dayNum = target.getDate();
  return `${dayName} ${month} ${dayNum}`;
}

export function formatDisplayTime(hour: number): string {
  const meridiem = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${meridiem}`;
}

export function formatSlotSuggestion(
  slot: { displayDay?: string | null; displayTime?: string | null; date?: string; hour?: number },
  reference: Date = new Date(),
): string {
  let day = slot.displayDay?.trim();
  if (!day && slot.date) {
    const [y, m, d] = slot.date.split("-").map(Number);
    day = displayDayForDate(new Date(y, m - 1, d, 12), reference);
  }
  if (!day) day = "Soon";

  let time = slot.displayTime?.trim();
  if (!time && typeof slot.hour === "number") {
    time = formatDisplayTime(slot.hour);
  }
  if (!time) time = "open slot";

  return `${day} at ${time}`;
}

export function formatAlternativesText(
  alternatives: Array<{ displayDay: string; displayTime: string }>,
): string {
  if (alternatives.length === 0) {
    return "Try another day or call us and we'll sort it out.";
  }
  const labels = alternatives.slice(0, 3).map((a) => `${a.displayDay} at ${a.displayTime}`);
  if (labels.length === 1) return `How about ${labels[0]}?`;
  if (labels.length === 2) return `How about ${labels[0]} or ${labels[1]}?`;
  return `How about ${labels[0]}, ${labels[1]}, or ${labels[2]}?`;
}

export { DAY_NAMES };
