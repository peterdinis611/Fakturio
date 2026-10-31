"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type { ConnectivityStatus, HealthProbeResult } from "./types";

const HEALTHY_POLL_MS = 20_000;
const UNHEALTHY_POLL_MS = 5_000;

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

  const check = useCallback(async () => {
    setChecking(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        applyStatus("offline");
        return "offline" as const;
      }
      const ok = await probeServer();
      const next: ConnectivityStatus = ok ? "online" : "server-down";
      applyStatus(next);
      return next;
    } finally {
      setChecking(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void check();

    function onOnline() {
      void check();
    }
    function onOffline() {
      applyStatus("offline");
      setReady(true);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [check]);

  useEffect(() => {
    if (!ready) return;
    const intervalMs =
      status === "online" ? HEALTHY_POLL_MS : UNHEALTHY_POLL_MS;
    const id = window.setInterval(() => {
      void check();
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
    check,
    consumeRestoredFlag,
  };
}
