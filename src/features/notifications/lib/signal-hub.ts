"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type ILogger,
} from "@microsoft/signalr";

const DEFAULT_BASE = "http://localhost:5148";

/** Grace period so soft-nav remounts don't tear down a still-needed hub. */
const RELEASE_GRACE_MS = 1500;

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    process.env.API_BASE_URL?.replace(/\/$/, "") ||
    DEFAULT_BASE
  );
}

/**
 * SignalR's default logger uses console.error, which Next.js turns into a
 * fullscreen overlay even when start() is caught. Keep noise in debug.
 */
const quietLogger: ILogger = {
  log(logLevel, message) {
    if (logLevel < LogLevel.Warning) return;
    if (process.env.NODE_ENV === "development") {
      console.debug(`[signal-hub] ${message}`);
    }
  },
};

let connection: HubConnection | null = null;
let startPromise: Promise<HubConnection | null> | null = null;
let subscribers = 0;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchHubToken(): Promise<string> {
  const res = await fetch("/api/notifications/hub-token", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`hub_token_failed:${res.status}`);
  const data = (await res.json()) as { accessToken?: string };
  if (!data.accessToken) throw new Error("hub_token_missing");
  return data.accessToken;
}

function buildConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(`${apiBaseUrl()}/hubs/signal`, {
      accessTokenFactory: fetchHubToken,
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(quietLogger)
    .build();
}

async function startSignalHub(): Promise<HubConnection | null> {
  if (connection?.state === HubConnectionState.Connected) {
    return connection;
  }
  if (startPromise) return startPromise;

  startPromise = (async () => {
    try {
      if (!connection || connection.state === HubConnectionState.Disconnected) {
        connection = buildConnection();
      }

      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      }

      return connection;
    } catch (err) {
      console.debug("[signal-hub] start failed — inbox falls back to REST", err);
      connection = null;
      return null;
    } finally {
      startPromise = null;
    }
  })();

  return startPromise;
}

async function stopSignalHub(): Promise<void> {
  startPromise = null;
  if (!connection) return;
  const hub = connection;
  connection = null;
  try {
    if (hub.state !== HubConnectionState.Disconnected) {
      await hub.stop();
    }
  } catch {
    // ignore teardown errors
  }
}

/** Acquire a shared hub connection (refcount). */
export async function acquireSignalHub(): Promise<HubConnection | null> {
  subscribers += 1;
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  return startSignalHub();
}

/** Release a subscriber; stops the hub only after grace when count hits 0. */
export function releaseSignalHub(): void {
  subscribers = Math.max(0, subscribers - 1);
  if (subscribers > 0) return;

  if (releaseTimer) clearTimeout(releaseTimer);
  releaseTimer = setTimeout(() => {
    releaseTimer = null;
    if (subscribers === 0) {
      void stopSignalHub();
    }
  }, RELEASE_GRACE_MS);
}
