"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon } from "@/components/ui";

import {
  useWorkloadDashboard,
  useRebalanceSuggestions,
  useTriggerAutoAssign,
} from "../hooks/useOwnership";
import type { RebalanceSuggestion } from "../types/ownership.types";
import { WorkloadCard } from "./WorkloadCard";

// ── Suggestion row ─────────────────────────────────────────

function SuggestionRow({ s }: { s: RebalanceSuggestion }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "#f9fafb",
        borderRadius: 8,
        fontSize: 13,
        color: "#374151",
      }}
    >
      <Icon name="arrow-right-left" size={14} />
      <span>
        Move <strong>{s.count}</strong> {s.entityType.toLowerCase().replace(/_/g, " ")}(s)
        from <strong>{s.fromUserName}</strong> to <strong>{s.toUserName}</strong>
      </span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>
        {s.reason}
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────

export function WorkloadDashboard() {
  const { data: dashboardData, isLoading, isError } = useWorkloadDashboard();
  const { data: suggestionsData } = useRebalanceSuggestions();
  const autoAssignMut = useTriggerAutoAssign();

  const dashboard = useMemo(() => {
    const raw = dashboardData?.data;
    return raw ?? { members: [], totalEntities: 0, averageLoad: 0 };
  }, [dashboardData]);

  const suggestions = useMemo(() => {
    const raw = suggestionsData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [suggestionsData]);

  const handleAutoAssign = () => {
    autoAssignMut.mutate(undefined, {
      onSuccess: (res) => {
        const count = (res as any)?.data?.assigned ?? 0;
        toast.success(`Auto-assign completed: ${count} entities assigned`);
      },
      onError: () => {
        toast.error("Auto-assign failed");
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
        Loading workload data...
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444" }}>
        Failed to load workload dashboard.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            Workload Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
            Monitor team capacity and assignment distribution
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAutoAssign}
          disabled={autoAssignMut.isPending}
        >
          <Icon name="zap" size={16} />
          {autoAssignMut.isPending ? "Running..." : "Run Auto-Assign"}
        </Button>
      </div>

      {/* Stats header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Team Members
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              margin: "4px 0 0 0",
            }}
          >
            {dashboard.members.length}
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Entities
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              margin: "4px 0 0 0",
            }}
          >
            {dashboard.totalEntities}
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Average Load
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color:
                dashboard.averageLoad >= 90
                  ? "#ef4444"
                  : dashboard.averageLoad >= 70
                    ? "#f59e0b"
                    : "#22c55e",
              margin: "4px 0 0 0",
            }}
          >
            {Math.round(dashboard.averageLoad)}%
          </p>
        </div>
      </div>

      {/* Rebalance suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Icon name="lightbulb" size={16} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
              Rebalance Suggestions
            </h3>
            <Badge variant="warning">{suggestions.length}</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((s, i) => (
              <SuggestionRow key={`${s.fromUserId}-${s.toUserId}-${i}`} s={s} />
            ))}
          </div>
        </div>
      )}

      {/* Workload cards grid */}
      {dashboard.members.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          <Icon name="users" size={32} />
          <p style={{ marginTop: 8 }}>No team members found.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}
        >
          {dashboard.members.map((member) => (
            <WorkloadCard key={member.id} capacity={member} />
          ))}
        </div>
      )}
    </div>
  );
}
