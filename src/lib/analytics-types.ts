export type AnalyticsEventType = "session" | "pageview" | "click" | "heartbeat";

export type SessionEvent = {
  type: "session";
  visitorId: string;
  userAgent?: string;
  referrer?: string;
  device?: string;
};

export type PageViewEvent = {
  type: "pageview";
  sessionId: string;
  path: string;
  enteredAt?: string;
  pageViewId?: string;
};

export type ClickEventPayload = {
  type: "click";
  sessionId: string;
  path: string;
  elementLabel: string;
  elementId?: string | null;
  clickedAt?: string;
};

export type HeartbeatEvent = {
  type: "heartbeat";
  sessionId: string;
  path: string;
  pageViewId?: string;
  durationMs: number;
};

export type AnalyticsEvent = SessionEvent | PageViewEvent | ClickEventPayload | HeartbeatEvent;

export type AnalyticsBatchPayload = {
  events: AnalyticsEvent[];
};

export type AnalyticsSummary = {
  configured: boolean;
  visitors7d: number;
  visitors30d: number;
  sessionsToday: number;
  pageViewsByPath: { path: string; count: number }[];
  topClicks: { label: string; count: number }[];
  avgTimeByPath: { path: string; avgMs: number; views: number }[];
  visitorsByDay: { date: string; count: number }[];
};
