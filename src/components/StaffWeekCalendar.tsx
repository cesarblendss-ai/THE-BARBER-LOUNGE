import Link from "next/link";

import { formatBlockRange, formatShortDate, formatWeekRangeLabel } from "@/lib/shop-week";
import type { ShopWeekView } from "@/lib/shop-week-view";

type StaffWeekCalendarProps = {
  view: ShopWeekView;
  showEditLink?: boolean;
  editHref?: string;
};

function DayGlance({
  day,
  isToday,
}: {
  day: ShopWeekView["displayDays"][number];
  isToday: boolean;
}) {
  const closed = day.status === "closed";
  return (
    <div
      className={`flex min-w-0 flex-col items-center rounded-xl border px-1 py-2 text-center ${
        isToday
          ? "border-brass bg-brass/10"
          : closed
            ? "border-charcoal/10 bg-charcoal/[0.03]"
            : "border-charcoal/10 bg-white"
      }`}
    >
      <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
        {day.dayName.slice(0, 3)}
      </p>
      <p className="mt-0.5 font-serif text-lg font-semibold text-charcoal">
        {Number(day.date.slice(8))}
      </p>
      <p
        className={`mt-1 font-sans text-[10px] font-semibold uppercase tracking-wider ${
          closed ? "text-charcoal/40" : "text-brass-dark"
        }`}
      >
        {closed ? "Closed" : "Open"}
      </p>
    </div>
  );
}

export function StaffWeekCalendar({
  view,
  showEditLink = true,
  editHref = "/admin/calendar",
}: StaffWeekCalendarProps) {
  const { week, displayDays, today, saved } = view;

  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-label text-brass">This week</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-charcoal">
            {formatWeekRangeLabel(week.weekStart)}
          </h2>
          <p className="mt-1 text-sm text-charcoal/60">
            {saved
              ? "Shop schedule posted for the floor."
              : "Default hours — this week has not been posted yet."}
          </p>
        </div>
        {showEditLink ? (
          <Link
            href={editHref}
            className="inline-flex items-center justify-center rounded-full bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bone transition-colors hover:bg-charcoal/90"
          >
            Set this week
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {displayDays.map((day) => (
          <DayGlance key={day.date} day={day} isToday={day.date === today} />
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {displayDays.map((day) => {
          const isToday = day.date === today;
          const closed = day.status === "closed";
          return (
            <li
              key={day.date}
              className={`rounded-xl border px-4 py-3 ${
                isToday ? "border-brass/50 bg-brass/[0.06]" : "border-charcoal/10 bg-bone/60"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-serif text-lg font-semibold text-charcoal">
                  {day.dayName}{" "}
                  <span className="font-sans text-sm font-normal text-charcoal/50">
                    {formatShortDate(day.date)}
                    {isToday ? " · Today" : ""}
                  </span>
                </p>
                <p
                  className={`font-sans text-xs font-semibold uppercase tracking-wider ${
                    closed ? "text-charcoal/45" : "text-brass-dark"
                  }`}
                >
                  {closed ? "Closed" : day.hours}
                </p>
              </div>

              {day.notes ? <p className="mt-2 text-sm text-charcoal/80">{day.notes}</p> : null}

              {day.blocks.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {day.blocks.map((block, index) => (
                    <li
                      key={`${day.date}-block-${index}`}
                      className="rounded-lg bg-white/80 px-3 py-1.5 text-sm text-charcoal/80"
                    >
                      <span className="font-medium text-charcoal">{formatBlockRange(block)}</span>
                      {block.label ? <span className="text-charcoal/60"> · {block.label}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {day.appointmentCount > 0 ? (
                <p className="mt-2 text-xs text-charcoal/55">
                  {day.appointmentCount} website request{day.appointmentCount === 1 ? "" : "s"}
                  {day.bookedSlots.length > 0
                    ? ` — ${day.bookedSlots.map((slot) => slot.label).join("; ")}`
                    : ""}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
