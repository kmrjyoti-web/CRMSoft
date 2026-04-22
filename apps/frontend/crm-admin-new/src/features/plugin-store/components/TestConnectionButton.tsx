"use client";

import { useState } from "react";

import { Button, Badge, Icon } from "@/components/ui";

import { useTestConnection } from "../hooks/usePluginStore";
import type { HealthCheckResult } from "../types/plugin-store.types";

// ── Props ────────────────────────────────────────────────────────────

interface TestConnectionButtonProps {
  pluginCode: string;
}

// ── Component ────────────────────────────────────────────────────────

export function TestConnectionButton({ pluginCode }: TestConnectionButtonProps) {
  const testMutation = useTestConnection();
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  const handleTest = async () => {
    setResult(null);
    try {
      const res = await testMutation.mutateAsync(pluginCode);
      const data = (res as any)?.data ?? res;
      setResult(data as HealthCheckResult);
    } catch {
      setResult({ success: false, message: "Connection test failed" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={testMutation.isPending}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="wifi" size={14} />
          {testMutation.isPending ? "Testing…" : "Test Connection"}
        </span>
      </Button>

      {result && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
            background: result.success ? "#f0fdf4" : "#fef2f2",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
          }}
        >
          <Icon
            name={result.success ? "check-circle" : "x-circle"}
            size={18}
            color={result.success ? "#16a34a" : "#dc2626"}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: result.success ? "#15803d" : "#b91c1c" }}>
              {result.success ? "Connected" : "Failed"}
            </div>
            <div style={{ color: result.success ? "#166534" : "#991b1b", marginTop: 2 }}>
              {result.message}
            </div>
          </div>
          {result.latencyMs != null && (
            <Badge variant={result.success ? "success" : "danger"}>
              {result.latencyMs}ms
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
