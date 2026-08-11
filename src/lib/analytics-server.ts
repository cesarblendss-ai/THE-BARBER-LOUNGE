import type { Prisma } from "@prisma/client";

import type {
  AnalyticsEvent,
  AnalyticsSummary,
  ClickEventPayload,
  HeartbeatEvent,
  PageViewEvent,
  SessionEvent,
} from "@/lib/analytics-types";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;

export function checkAnalyticsRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(days: number): Date {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
}

export async function ingestAnalyticsEvents(
  events: AnalyticsEvent[],
): Promise<{ sessionId?: string; pageViewIds?: Record<string, string> }> {
  const prisma = getPrisma();
  if (!prisma) return {};

  let sessionId: string | undefined;
  const pageViewIds: Record<string, string> = {};

  for (const event of events) {
    switch (event.type) {
      case "session": {
        const created = await createSession(event);
        sessionId = created.id;
        break;
      }
      case "pageview": {
        const resolvedSessionId =
          event.sessionId === "__pending__" ? sessionId : event.sessionId;
        if (!resolvedSessionId) break;

        const created = await createPageView({ ...event, sessionId: resolvedSessionId });
        pageViewIds[event.path] = created.id;
        sessionId = resolvedSessionId;
        break;
      }
      case "click": {
        if (event.sessionId === "__pending__" && !sessionId) break;
        await createClick({
          ...event,
          sessionId: event.sessionId === "__pending__" ? sessionId! : event.sessionId,
        });
        if (event.sessionId !== "__pending__") sessionId = event.sessionId;
        break;
      }
      case "heartbeat": {
        const resolvedSessionId =
          event.sessionId === "__pending__" ? sessionId : event.sessionId;
        if (!resolvedSessionId) break;
        await updateHeartbeat({ ...event, sessionId: resolvedSessionId });
        sessionId = resolvedSessionId;
        break;
      }
    }
  }

  return { sessionId, pageViewIds };
}

async function createSession(event: SessionEvent) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  return prisma.session.create({
    data: {
      visitorId: event.visitorId,
      userAgent: event.userAgent?.slice(0, 512) ?? null,
      referrer: event.referrer?.slice(0, 512) ?? null,
      device: event.device?.slice(0, 64) ?? null,
    },
  });
}

async function createPageView(event: PageViewEvent) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  return prisma.pageView.create({
    data: {
      sessionId: event.sessionId,
      path: event.path.slice(0, 512),
      enteredAt: event.enteredAt ? new Date(event.enteredAt) : undefined,
    },
  });
}

async function createClick(event: ClickEventPayload) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  return prisma.clickEvent.create({
    data: {
      sessionId: event.sessionId,
      path: event.path.slice(0, 512),
      elementLabel: event.elementLabel.slice(0, 256),
      elementId: event.elementId?.slice(0, 128) ?? null,
      clickedAt: event.clickedAt ? new Date(event.clickedAt) : undefined,
    },
  });
}

async function updateHeartbeat(event: HeartbeatEvent) {
  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured");

  const durationMs = Math.max(0, Math.min(event.durationMs, 3_600_000));

  if (event.pageViewId) {
    await prisma.pageView.updateMany({
      where: { id: event.pageViewId, sessionId: event.sessionId, path: event.path },
      data: { durationMs, exitedAt: new Date() },
    });
    return;
  }

  const latest = await prisma.pageView.findFirst({
    where: { sessionId: event.sessionId, path: event.path, exitedAt: null },
    orderBy: { enteredAt: "desc" },
  });

  if (!latest) return;

  await prisma.pageView.update({
    where: { id: latest.id },
    data: { durationMs, exitedAt: new Date() },
  });
}

export async function closePageView(
  sessionId: string,
  path: string,
  durationMs: number,
  pageViewId?: string,
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  const safeDuration = Math.max(0, Math.min(durationMs, 3_600_000));

  if (pageViewId) {
    await prisma.pageView.updateMany({
      where: { id: pageViewId, sessionId },
      data: { durationMs: safeDuration, exitedAt: new Date() },
    });
    return;
  }

  const latest = await prisma.pageView.findFirst({
    where: { sessionId, path, exitedAt: null },
    orderBy: { enteredAt: "desc" },
  });

  if (!latest) return;

  await prisma.pageView.update({
    where: { id: latest.id },
    data: { durationMs: safeDuration, exitedAt: new Date() },
  });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!isDatabaseConfigured()) {
    return emptySummary(false);
  }

  const prisma = getPrisma();
  if (!prisma) return emptySummary(false);

  const since7 = daysAgo(7);
  const since30 = daysAgo(30);
  const todayStart = startOfDay(new Date());

  const [
    visitors7dRows,
    visitors30dRows,
    sessionsToday,
    pageViewsByPath,
    topClicks,
    avgTimeRows,
    sessions30d,
  ] = await Promise.all([
    prisma.session.findMany({
      where: { startedAt: { gte: since7 } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.session.findMany({
      where: { startedAt: { gte: since30 } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.session.count({ where: { startedAt: { gte: todayStart } } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { enteredAt: { gte: since30 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 15,
    }),
    prisma.clickEvent.groupBy({
      by: ["elementLabel"],
      where: { clickedAt: { gte: since30 } },
      _count: { elementLabel: true },
      orderBy: { _count: { elementLabel: "desc" } },
      take: 15,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: {
        enteredAt: { gte: since30 },
        durationMs: { not: null },
      },
      _avg: { durationMs: true },
      _count: { path: true },
      orderBy: { _avg: { durationMs: "desc" } },
      take: 15,
    }),
    prisma.session.findMany({
      where: { startedAt: { gte: since30 } },
      select: { startedAt: true, visitorId: true },
    }),
  ]);

  const visitorsByDayMap = new Map<string, Set<string>>();
  for (const session of sessions30d) {
    const day = session.startedAt.toISOString().slice(0, 10);
    if (!visitorsByDayMap.has(day)) visitorsByDayMap.set(day, new Set());
    visitorsByDayMap.get(day)!.add(session.visitorId);
  }

  const visitorsByDay: AnalyticsSummary["visitorsByDay"] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const key = date.toISOString().slice(0, 10);
    visitorsByDay.push({ date: key, count: visitorsByDayMap.get(key)?.size ?? 0 });
  }

  return {
    configured: true,
    visitors7d: visitors7dRows.length,
    visitors30d: visitors30dRows.length,
    sessionsToday,
    pageViewsByPath: pageViewsByPath.map((row) => ({
      path: row.path,
      count: row._count.path,
    })),
    topClicks: topClicks.map((row) => ({
      label: row.elementLabel,
      count: row._count.elementLabel,
    })),
    avgTimeByPath: avgTimeRows.map((row) => ({
      path: row.path,
      avgMs: Math.round(row._avg.durationMs ?? 0),
      views: row._count.path,
    })),
    visitorsByDay,
  };
}

function emptySummary(configured: boolean): AnalyticsSummary {
  return {
    configured,
    visitors7d: 0,
    visitors30d: 0,
    sessionsToday: 0,
    pageViewsByPath: [],
    topClicks: [],
    avgTimeByPath: [],
    visitorsByDay: [],
  };
}

export type { Prisma };
