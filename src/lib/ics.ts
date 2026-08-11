import type { Appointment } from "@/lib/appointments-store";
import { SITE } from "@/lib/content";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatLocalIcs(dateStr: string, hour: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hour)}0000`;
}

export function generateAppointmentIcs(appointment: Appointment): string {
  const uid = `${appointment.confirmationCode}@thebarberlounge.com`;
  const summary = `${appointment.service} — The Barber Lounge`;
  const description = [
    `Confirmation: ${appointment.confirmationCode}`,
    `Guest: ${appointment.name}`,
    `Phone: ${appointment.phone}`,
    appointment.guestCount ? `Guests: ${appointment.guestCount}` : null,
  ]
    .filter(Boolean)
    .join("\\n");

  const dtStart = formatLocalIcs(appointment.slotDate, appointment.slotHour);
  const dtEnd = formatLocalIcs(appointment.slotDate, appointment.slotHour + 1);
  const dtStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Barber Lounge//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Los_Angeles",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0700",
    "TZOFFSETTO:-0800",
    "TZNAME:PST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0800",
    "TZOFFSETTO:-0700",
    "TZNAME:PDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/Los_Angeles:${dtStart}`,
    `DTEND;TZID=America/Los_Angeles:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${SITE.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
