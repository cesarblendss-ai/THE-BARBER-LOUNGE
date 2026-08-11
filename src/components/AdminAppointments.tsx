"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SectionLabel } from "@/components/SectionLabel";

type Appointment = {
  id: string;
  confirmationCode: string;
  service: string;
  preferredDay: string;
  preferredTime: string;
  slotDate: string;
  slotHour: number;
  name: string;
  phone: string;
  guestCount: number | null;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

type ScheduleSlot = {
  hour: number;
  displayTime: string;
  blocked: boolean;
  appointment: Appointment | null;
};

type AdminData = {
  date: string;
  appointments: Appointment[];
  schedule: ScheduleSlot[];
};

function statusBadge(status: Appointment["status"]) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-charcoal/10 text-charcoal/50 line-through",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

export function AdminAppointmentsClient({ authKey }: { authKey?: string }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = authKey ? `?key=${encodeURIComponent(authKey)}` : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments${query}&date=${date}`.replace("?&", "?"));
      if (!res.ok) throw new Error("Could not load appointments.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [date, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/appointments${query}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Action failed.");
    await load();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-sm text-charcoal/70">
          Schedule date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block rounded-lg border border-charcoal/15 bg-bone px-3 py-2 text-charcoal"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-charcoal/15 px-4 py-2 text-sm text-charcoal hover:border-brass"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-burgundy">{error}</p>}
      {loading && <p className="text-sm text-charcoal/50">Loading…</p>}

      {data && (
        <>
          <section>
            <h2 className="font-serif text-2xl text-charcoal">Today&apos;s slots</h2>
            <p className="mt-1 text-sm text-charcoal/60">
              Tap a slot to block/unblock (mirror Booksy holds). Booked slots show the appointment.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.schedule.map((slot) => {
                const booked = Boolean(slot.appointment);
                const blocked = slot.blocked && !booked;
                return (
                  <button
                    key={slot.hour}
                    type="button"
                    disabled={booked}
                    onClick={() =>
                      void patch({ action: "toggle-block", date, hour: slot.hour }).catch(() =>
                        setError("Could not toggle block."),
                      )
                    }
                    className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                      booked
                        ? "border-brass/40 bg-brass/10"
                        : blocked
                          ? "border-charcoal/30 bg-charcoal/10"
                          : "border-charcoal/10 bg-bone hover:border-brass/40"
                    }`}
                  >
                    <p className="font-medium text-charcoal">{slot.displayTime}</p>
                    {slot.appointment ? (
                      <p className="mt-1 text-xs text-charcoal/70">
                        {slot.appointment.name}
                        <br />
                        {slot.appointment.service}
                      </p>
                    ) : blocked ? (
                      <p className="mt-1 text-xs text-charcoal/50">Blocked</p>
                    ) : (
                      <p className="mt-1 text-xs text-charcoal/40">Open</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">All requests</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-charcoal/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-charcoal/10 bg-charcoal/5 text-xs uppercase tracking-wider text-charcoal/60">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-charcoal/50">
                        No appointment requests yet.
                      </td>
                    </tr>
                  ) : (
                    data.appointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-charcoal/8">
                        <td className="px-4 py-3 font-mono text-xs">{appt.confirmationCode}</td>
                        <td className="px-4 py-3">
                          <div>{appt.name}</div>
                          <div className="text-xs text-charcoal/50">{appt.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          {appt.service}
                          {appt.guestCount && appt.guestCount > 1 ? (
                            <span className="text-charcoal/50"> · {appt.guestCount} guests</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          {appt.preferredDay} {appt.preferredTime}
                        </td>
                        <td className="px-4 py-3">{statusBadge(appt.status)}</td>
                        <td className="px-4 py-3">
                          {appt.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void patch({ action: "confirm", id: appt.id }).catch(() =>
                                    setError("Confirm failed."),
                                  )
                                }
                                className="text-xs font-semibold text-green-700 hover:underline"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void patch({ action: "cancel", id: appt.id }).catch(() =>
                                    setError("Cancel failed."),
                                  )
                                }
                                className="text-xs text-charcoal/50 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <div className="text-center text-xs text-charcoal/45">
        <Link href="/admin/products" className="text-brass hover:underline">
          Retail products
        </Link>
        {" · "}
        <Link href="/admin/notifications" className="text-brass hover:underline">
          Push notification setup
        </Link>
        {" · "}
        <Link href="/admin/gallery" className="text-brass hover:underline">
          Gallery admin
        </Link>
      </div>
    </div>
  );
}
