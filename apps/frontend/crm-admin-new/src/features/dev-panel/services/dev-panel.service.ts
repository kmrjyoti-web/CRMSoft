import { api } from "@/services/api-client";

import type { EndpointHealth, HealthStatus } from "../types/dev-panel.types";

// ── Endpoints to check ──────────────────────────────────

const ENDPOINTS: Omit<EndpointHealth, "status" | "statusCode" | "responseTimeMs" | "lastChecked" | "error">[] = [
  { name: "Auth", url: "/api/v1/auth/profile", method: "GET", group: "Auth" },
  { name: "Contacts", url: "/api/v1/contacts", method: "GET", group: "CRM" },
  { name: "Organizations", url: "/api/v1/organizations", method: "GET", group: "CRM" },
  { name: "Leads", url: "/api/v1/leads", method: "GET", group: "CRM" },
  { name: "Activities", url: "/api/v1/activities", method: "GET", group: "CRM" },
  { name: "Quotations", url: "/api/v1/quotations", method: "GET", group: "Finance" },
  { name: "Invoices", url: "/api/v1/invoices", method: "GET", group: "Finance" },
  { name: "Users", url: "/api/v1/users", method: "GET", group: "Settings" },
  { name: "Roles", url: "/api/v1/roles", method: "GET", group: "Settings" },
];

// ── Health check service ────────────────────────────────

function resolveStatus(statusCode: number, durationMs: number): HealthStatus {
  if (statusCode >= 500) return "down";
  if (statusCode >= 400) return "degraded";
  if (durationMs > 3000) return "degraded";
  return "healthy";
}

export async function pingEndpoint(
  endpoint: Omit<EndpointHealth, "status" | "statusCode" | "responseTimeMs" | "lastChecked" | "error">,
): Promise<EndpointHealth> {
  const start = performance.now();
  try {
    const res = await api.request({
      url: endpoint.url,
      method: endpoint.method,
      timeout: 10_000,
      params: { _limit: 1 },
    });
    const duration = Math.round(performance.now() - start);
    return {
      ...endpoint,
      status: resolveStatus(res.status, duration),
      statusCode: res.status,
      responseTimeMs: duration,
      lastChecked: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - start);
    const axiosErr = err as { response?: { status?: number }; message?: string };
    return {
      ...endpoint,
      status: axiosErr.response?.status ? "degraded" : "down",
      statusCode: axiosErr.response?.status,
      responseTimeMs: duration,
      lastChecked: new Date().toISOString(),
      error: axiosErr.message ?? "Unknown error",
    };
  }
}

export async function pingAllEndpoints(): Promise<EndpointHealth[]> {
  const results = await Promise.allSettled(ENDPOINTS.map(pingEndpoint));
  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { ...ENDPOINTS[i], status: "down" as const, lastChecked: new Date().toISOString(), error: "Request failed" },
  );
}

export { ENDPOINTS };
