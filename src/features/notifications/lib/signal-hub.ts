"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

const DEFAULT_BASE = "http://localhost:5148";

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    process.env.API_BASE_URL?.replace(/\/$/, "") ||
    DEFAULT_BASE
  );
}

let connection: HubConnection | null = null;

async function fetchHubToken(): Promise<string> {
  const res = await fetch("/api/notifications/hub-token", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("hub_token_failed");
  const data = (await res.json()) as { accessToken?: string };
  if (!data.accessToken) throw new Error("hub_token_missing");
  return data.accessToken;
}

export async function getSignalHubConnection(): Promise<HubConnection> {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`${apiBaseUrl()}/hubs/signal`, {
      accessTokenFactory: fetchHubToken,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

export async function startSignalHub(): Promise<HubConnection> {
  const hub = await getSignalHubConnection();
  if (hub.state === HubConnectionState.Disconnected) {
    await hub.start();
  }
  return hub;
}

export async function stopSignalHub(): Promise<void> {
  if (!connection) return;
  const hub = connection;
  connection = null;
  if (hub.state !== HubConnectionState.Disconnected) {
    await hub.stop();
  }
}
