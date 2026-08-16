import type { AnalyticsSummary } from "@/lib/analytics-types";

type AnalyticsDashboardProps = {
  summary: AnalyticsSummary;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem > 0 ? `${minutes}m ${rem}s` : `${minutes}m`;
}

function BarChart({
  items,
  labelKey,
  valueKey,
  maxItems = 10,
}: {
  items: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  maxItems?: number;
}) {
  const slice = items.slice(0, maxItems);
  const max = Math.max(...slice.map((item) => Number(item[valueKey]) || 0), 1);

  if (slice.length === 0) {
    return <p className="text-sm text-charcoal/50">No data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {slice.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const pct = Math.max(4, Math.round((value / max) * 100));
        return (
          <div key={String(item[labelKey])}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-charcoal/80">{String(item[labelKey])}</span>
              <span className="shrink-0 font-medium tabular-nums text-charcoal">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-charcoal/10">
              <div
                className="h-full rounded-full bg-brass transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-bone p-5">
      <p className="text-xs font-semibold uppercase tracking-label text-charcoal/45">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-charcoal">{value}</p>
    </div>
  );
}

export function AnalyticsDashboard({ summary }: AnalyticsDashboardProps) {
  const visitorChartItems = summary.visitorsByDay.map((row) => ({
    date: row.date.slice(5),
    count: row.count,
  }));

  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitors (7 days)" value={summary.visitors7d} />
        <StatCard label="Visitors (30 days)" value={summary.visitors30d} />
        <StatCard label="Sessions today" value={summary.sessionsToday} />
        <StatCard
          label="Page views (30d)"
          value={summary.pageViewsByPath.reduce((sum, row) => sum + row.count, 0)}
        />
      </div>

      <div className="rounded-2xl border border-charcoal/10 bg-bone p-6">
        <h2 className="font-serif text-xl text-charcoal">Visitors over time (30 days)</h2>
        <div className="mt-6">
          <BarChart items={visitorChartItems} labelKey="date" valueKey="count" maxItems={30} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-charcoal/10 bg-bone p-6">
          <h2 className="font-serif text-xl text-charcoal">Top pages (30 days)</h2>
          <div className="mt-6">
            <BarChart
              items={summary.pageViewsByPath.map((row) => ({ path: row.path, count: row.count }))}
              labelKey="path"
              valueKey="count"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-charcoal/10 bg-bone p-6">
          <h2 className="font-serif text-xl text-charcoal">Top clicks (30 days)</h2>
          <div className="mt-6">
            <BarChart
              items={summary.topClicks.map((row) => ({ label: row.label, count: row.count }))}
              labelKey="label"
              valueKey="count"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-charcoal/10 bg-bone p-6">
        <h2 className="font-serif text-xl text-charcoal">Avg. time on page (30 days)</h2>
        {summary.avgTimeByPath.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/50">No duration data yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-xs uppercase tracking-label text-charcoal/45">
                  <th className="py-2 pr-4 font-semibold">Path</th>
                  <th className="py-2 pr-4 font-semibold">Avg time</th>
                  <th className="py-2 font-semibold">Views</th>
                </tr>
              </thead>
              <tbody>
                {summary.avgTimeByPath.map((row) => (
                  <tr key={row.path} className="border-b border-charcoal/5">
                    <td className="py-2.5 pr-4 text-charcoal/80">{row.path}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-charcoal">
                      {formatDuration(row.avgMs)}
                    </td>
                    <td className="py-2.5 tabular-nums text-charcoal/70">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
