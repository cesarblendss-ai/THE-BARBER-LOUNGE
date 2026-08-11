"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import type { AnalyticsEvent } from "@/lib/analytics-types";

const VISITOR_COOKIE = "tbl_vid";
const SESSION_STORAGE_KEY = "tbl_sid";
const HEARTBEAT_MS = 30_000;
const BATCH_FLUSH_MS = 2_000;

function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const dnt = navigator.doNotTrack ?? (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === "1" || dnt === "yes";
}

function shouldTrackPath(path: string): boolean {
  return !path.startsWith("/admin");
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE);
  if (existing) return existing;

  const id = crypto.randomUUID();
  writeCookie(VISITOR_COOKIE, id, 60 * 60 * 24 * 365);
  return id;
}

function getClickLabel(target: Element): { label: string; id: string | null } {
  const el = target.closest<HTMLElement>(
    "button, a, [role='button'], input[type='submit'], [data-analytics-label]",
  );
  if (!el) return { label: "", id: null };

  const analyticsLabel = el.getAttribute("data-analytics-label");
  if (analyticsLabel?.trim()) {
    return { label: analyticsLabel.trim(), id: el.id || null };
  }

  const aria = el.getAttribute("aria-label")?.trim();
  if (aria) return { label: aria, id: el.id || null };

  const text = el.textContent?.replace(/\s+/g, " ").trim();
  if (text) return { label: text.slice(0, 120), id: el.id || null };

  if (el.id) return { label: el.id, id: el.id };

  return { label: el.tagName.toLowerCase(), id: null };
}

function isTrackableClick(target: Element): boolean {
  return Boolean(
    target.closest(
      "button, a, [role='button'], input[type='submit'], [data-analytics-label]",
    ),
  );
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const queueRef = useRef<AnalyticsEvent[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const pageEnteredAtRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>("");
  const currentPageViewIdRef = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef<string | null>(
    typeof window !== "undefined" ? sessionStorage.getItem(SESSION_STORAGE_KEY) : null,
  );
  const visitorIdRef = useRef<string>("");
  const warnedRef = useRef(false);
  const initializedRef = useRef(false);

  const flushQueue = useCallback(async () => {
    if (queueRef.current.length === 0) return;

    const batch = queueRef.current.splice(0, queueRef.current.length);

    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });

      if (!response.ok) {
        if (response.status === 503 && !warnedRef.current) {
          warnedRef.current = true;
          console.warn("[analytics] DATABASE_URL not configured — events are not persisted.");
        }
        return;
      }

      const data = (await response.json()) as {
        sessionId?: string;
        pageViewIds?: Record<string, string>;
      };

      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
        sessionStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
      }

      if (data.pageViewIds && currentPathRef.current) {
        const pageViewId = data.pageViewIds[currentPathRef.current];
        if (pageViewId) currentPageViewIdRef.current = pageViewId;
      }
    } catch {
      // Silent fail — analytics should never break the site
    }
  }, []);

  const enqueue = useCallback(
    (event: AnalyticsEvent) => {
      queueRef.current.push(event);

      if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
      flushTimerRef.current = window.setTimeout(() => {
        void flushQueue();
      }, BATCH_FLUSH_MS);
    },
    [flushQueue],
  );

  const sendHeartbeat = useCallback(() => {
    const sessionId = sessionIdRef.current;
    const path = currentPathRef.current;
    if (!sessionId || !path) return;

    const durationMs = Date.now() - pageEnteredAtRef.current;
    enqueue({
      type: "heartbeat",
      sessionId,
      path,
      pageViewId: currentPageViewIdRef.current,
      durationMs,
    });
  }, [enqueue]);

  const trackPageView = useCallback(
    (path: string) => {
      if (!shouldTrackPath(path)) return;

      const previousPath = currentPathRef.current;
      const previousSessionId = sessionIdRef.current;

      if (previousPath && previousSessionId && previousPath !== path) {
        const durationMs = Date.now() - pageEnteredAtRef.current;
        enqueue({
          type: "heartbeat",
          sessionId: previousSessionId,
          path: previousPath,
          pageViewId: currentPageViewIdRef.current,
          durationMs,
        });
      }

      currentPathRef.current = path;
      pageEnteredAtRef.current = Date.now();
      currentPageViewIdRef.current = undefined;

      if (!sessionIdRef.current) {
        visitorIdRef.current = getOrCreateVisitorId();
        enqueue({
          type: "session",
          visitorId: visitorIdRef.current,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
          device: getDeviceType(),
        });
      }

      enqueue({
        type: "pageview",
        sessionId: sessionIdRef.current ?? "__pending__",
        path,
        enteredAt: new Date().toISOString(),
      });
    },
    [enqueue],
  );

  useEffect(() => {
    if (isDoNotTrackEnabled()) return;
    if (!shouldTrackPath(pathname)) return;

    visitorIdRef.current = getOrCreateVisitorId();

    if (!initializedRef.current) {
      initializedRef.current = true;
    }

    trackPageView(pathname);

    heartbeatTimerRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
    };
  }, [pathname, sendHeartbeat, trackPageView]);

  useEffect(() => {
    if (isDoNotTrackEnabled()) return;

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!isTrackableClick(target)) return;

      const path = currentPathRef.current;
      const sessionId = sessionIdRef.current;
      if (!path || !sessionId || !shouldTrackPath(path)) return;

      const { label, id } = getClickLabel(target);
      if (!label) return;

      enqueue({
        type: "click",
        sessionId,
        path,
        elementLabel: label,
        elementId: id,
        clickedAt: new Date().toISOString(),
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        void flushQueue();
      }
    }

    function onPageHide() {
      void flushQueue();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
      void flushQueue();
    };
  }, [enqueue, flushQueue]);

  return null;
}
