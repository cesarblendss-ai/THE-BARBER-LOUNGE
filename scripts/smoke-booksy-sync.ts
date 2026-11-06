import { refreshAvailabilitySnapshot } from "../src/lib/availability-sync";

async function main() {
  const snap = await refreshAvailabilitySnapshot("admin");
  console.log(JSON.stringify({
    booksyLiveSync: snap.booksyLiveSync,
    source: snap.source,
    lastSyncedAt: snap.lastSyncedAt,
    dayCount: snap.days.length,
    totalOpenSlots: Object.values(snap.slotsByDate).reduce((n, s) => n + s.length, 0),
    staffers: Object.fromEntries(
      Object.entries(snap.byBarber).map(([k, v]) => [
        k,
        {
          days: v.days.length,
          slots: Object.values(v.slotsByDate).reduce((n, s) => n + s.length, 0),
        },
      ]),
    ),
    sampleAny: snap.days.slice(0, 2).map((d) => ({
      date: d.date,
      count: d.availableCount,
      times: (snap.slotsByDate[d.date] || []).slice(0, 8).map((s) => s.displayTime),
    })),
    sampleCesar: (snap.byBarber["Cesar Silva"]?.days || []).slice(0, 2).map((d) => ({
      date: d.date,
      times: (snap.byBarber["Cesar Silva"].slotsByDate[d.date] || []).map((s) => s.displayTime),
    })),
    errors: snap.booksySyncErrors,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
