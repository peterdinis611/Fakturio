export type ConnectivityStatus = "online" | "offline" | "server-down";

export type HealthProbeResult = {
  ok: boolean;
  reason?: "ok" | "upstream" | "unreachable";
  latencyMs?: number;
};
