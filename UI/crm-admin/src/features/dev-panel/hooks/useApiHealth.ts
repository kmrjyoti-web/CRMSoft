"use client";

import { useState, useCallback } from "react";

import { pingAllEndpoints } from "../services/dev-panel.service";

import type { EndpointHealth, ApiHealthSummary } from "../types/dev-panel.types";

export function useApiHealth() {
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    try {
      const results = await pingAllEndpoints();
      setEndpoints(results);
      setLastRun(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  const summary: ApiHealthSummary = {
    totalEndpoints: endpoints.length,
    healthy: endpoints.filter((e) => e.status === "healthy").length,
    degraded: endpoints.filter((e) => e.status === "degraded").length,
    down: endpoints.filter((e) => e.status === "down").length,
    avgResponseTime:
      endpoints.length > 0
        ? Math.round(
            endpoints.reduce((sum, e) => sum + (e.responseTimeMs ?? 0), 0) / endpoints.length,
          )
        : 0,
  };

  return { endpoints, summary, loading, lastRun, runHealthCheck };
}
