"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type { ConnectivityStatus, HealthProbeResult } from "./types";

/** Calm when healthy — banner only matters when something breaks. */
const HEALTHY_POLL_MS = 120_000;
/** Still gentle while recovering; user can hit Retry anytime. */
const UNHEALTHY_POLL_MS = 30_000;
/** Skip a new probe if one finished this recently (Strict Mode / remounts). */
const MIN_PROBE_GAP_MS = 15_000;

type ProbeOutcome = {
  status: ConnectivityStatus;
  at: number;
};

let inFlight: Promise<ConnectivityStatus> | null = null;
let lastProbe: ProbeOutcome | null = null;

async function probeServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as HealthProbeResult;
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

async function runProbe(force: boolean): Promise<ConnectivityStatus> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    lastProbe = { status: "offline", at: Date.now() };
    return "offline";
  }

  const now = Date.now();
  if (
    !force &&
    lastProbe &&
    now - lastProbe.at < MIN_PROBE_GAP_MS &&
    lastProbe.status === "online"
  ) {
    return lastProbe.status;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const ok = await probeServer();
    const status: ConnectivityStatus = ok ? "online" : "server-down";
    lastProbe = { status, at: Date.now() };
    return status;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

/**
 * Detects browser offline state and API backend reachability via /api/health.
 * Status stays "online" until after mount to avoid SSR hydration mismatches.
 */
export function useConnectivity() {
  const [status, setStatus] = useState<ConnectivityStatus>("online");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const wasDownRef = useRef(false);

  const applyStatus = useEffectEvent((next: ConnectivityStatus) => {
    setStatus((prev) => {
      if (prev !== "online" && next === "online") {
        wasDownRef.current = true;
      }
      return next;
    });
    setLastCheckedAt(Date.now());
  });

  const check = useCallback(async (force = false) => {
    setChecking(true);
    try {
      const next = await runProbe(force);
      applyStatus(next);
      return next;
    } finally {
      setChecking(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void check(false);

    function onOnline() {
      void check(true);
    }
    function onOffline() {
      lastProbe = { status: "offline", at: Date.now() };
      applyStatus("offline");
      setReady(true);
    }
    function onVisibility() {
      if (document.visibilityState !== "visible") return;
      const stale =
        !lastProbe || Date.now() - lastProbe.at >= HEALTHY_POLL_MS;
      if (stale) void check(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [check]);

  useEffect(() => {
    if (!ready) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    const intervalMs =
      status === "online" ? HEALTHY_POLL_MS : UNHEALTHY_POLL_MS;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void check(false);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [status, check, ready]);

  const consumeRestoredFlag = useCallback(() => {
    if (!wasDownRef.current) return false;
    wasDownRef.current = false;
    return true;
  }, []);

  return {
    status,
    ready,
    isOnline: status === "online",
    isOffline: status === "offline",
    isServerDown: status === "server-down",
    checking,
    lastCheckedAt,
    check: () => check(true),
    consumeRestoredFlag,
  };
}
