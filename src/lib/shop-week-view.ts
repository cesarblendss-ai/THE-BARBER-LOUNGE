import { formatDisplayTime } from "@/lib/booking-agent/format";
import { listAppointments, type Appointment, type BlockedSlot } from "@/lib/appointments-store";
import { shopTodayStr, type ShopWeek, type ShopWeekBlock, type ShopWeekDay } from "@/lib/shop-week";
import { loadShopWeek, type ShopWeekLoadResult } from "@/lib/shop-week-store";

export type ShopWeekDayView = ShopWeekDay & {
  appointmentCount: number;
  bookedSlots: Array<{ hour: number; label: string }>;
};

export type ShopWeekView = ShopWeekLoadResult & {
  week: ShopWeek;
  displayDays: ShopWeekDayView[];
  today: string;
};

function activeAppointments(appointments: Appointment[]): Appointment[] {
  return appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
}

function blocksFromStore(date: string, blockedSlots: BlockedSlot[]): ShopWeekBlock[] {
  return blockedSlots
    .filter((slot) => slot.date === date)
    .sort((a, b) => a.hour - b.hour)
    .map((slot) => ({
      startHour: slot.hour,
      endHour: Math.min(23, slot.hour + 1),
      label: slot.reason?.trim() || "Blocked",
    }));
}

function mergeBlocks(primary: ShopWeekBlock[], extra: ShopWeekBlock[]): ShopWeekBlock[] {
  const seen = new Set<string>();
  const merged: ShopWeekBlock[] = [];
  for (const block of [...primary, ...extra]) {
    const key = `${block.startHour}-${block.endHour}-${block.label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(block);
  }
  return merged.sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);
}

export async function getShopWeekView(weekStart?: string): Promise<ShopWeekView> {
  const [result, store] = await Promise.all([loadShopWeek(weekStart), listAppointments()]);
  const appointments = activeAppointments(store.appointments);

  const days: ShopWeekDayView[] = result.week.days.map((day) => {
    const forDay = appointments
      .filter((a) => a.slotDate === day.date)
      .sort((a, b) => a.slotHour - b.slotHour);
    const bookedSlots = forDay.map((a) => ({
      hour: a.slotHour,
      label: `${formatDisplayTime(a.slotHour)} · ${a.service}`,
    }));
    return {
      ...day,
      blocks: mergeBlocks(day.blocks, blocksFromStore(day.date, store.blockedSlots)),
      appointmentCount: forDay.length,
      bookedSlots,
    };
  });

  return {
    ...result,
    displayDays: days,
    today: shopTodayStr(),
  };
}
