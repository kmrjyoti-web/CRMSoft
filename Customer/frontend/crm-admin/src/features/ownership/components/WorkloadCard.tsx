"use client";

import { useMemo } from "react";

import { Badge, Icon } from "@/components/ui";

import type { UserCapacity } from "../types/ownership.types";

// ── Helpers ────────────────────────────────────────────────

function getLoadPercent(active: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((active / max) * 100);
}

function getLoadColor(percent: number): { bar: string; bg: string; text: string } {
  if (percent >= 90) return { bar: "#ef4444", bg: "#fef2f2", text: "#991b1b" };
  if (percent >= 70) return { bar: "#f59e0b", bg: "#fffbeb", text: "#92400e" };
  return { bar: "#22c55e", bg: "#f0fdf4", text: "#166534" };
}

function getLoadLabel(percent: number): string {
  if (percent >= 90) return "Overloaded";
  if (percent >= 70) return "High";
  return "Optimal";
}

// ── Props ──────────────────────────────────────────────────

interface WorkloadCardProps {
  capacity: UserCapacity;
}

// ── Breakdown row ──────────────────────────────────────────

function BreakdownRow({
  label,
  active,
  max,
  icon,
}: {
  label: string;
  active: number;
  max: number;
  icon: string;
}) {
  const pct = getLoadPercent(active, max);
  const colors = getLoadColor(pct);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#6b7280",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name={icon as any} size={14} />
        <span>{label}</span>
      </div>
      <span style={{ fontWeight: 500, color: colors.text }}>
        {active}/{max}
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────

export function WorkloadCard({ capacity }: WorkloadCardProps) {
  const userName = useMemo(() => {
    if (capacity.user) {
      return `${capacity.user.firstName} ${capacity.user.lastName}`;
    }
    return "Unknown User";
  }, [capacity.user]);

  const totalPercent = getLoadPercent(capacity.activeTotal, capacity.maxTotal);
  const colors = getLoadColor(totalPercent);
  const loadLabel = getLoadLabel(totalPercent);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="user" size={18} />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              {userName}
            </p>
            {capacity.user?.email && (
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                {capacity.user.email}
              </p>
            )}
          </div>
        </div>

        <Badge variant={capacity.isAvailable ? "success" : "danger"}>
          {capacity.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>

      {/* Total progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280" }}>Overall Load</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{ fontSize: 13, fontWeight: 600, color: colors.text }}
            >
              {totalPercent}%
            </span>
            <Badge
              variant={
                totalPercent >= 90
                  ? "danger"
                  : totalPercent >= 70
                    ? "warning"
                    : "success"
              }
            >
              {loadLabel}
            </Badge>
          </div>
        </div>

        <div
          style={{
            height: 8,
            background: "#f3f4f6",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(totalPercent, 100)}%`,
              background: colors.bar,
              borderRadius: 4,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 4,
            margin: "4px 0 0 0",
          }}
        >
          {capacity.activeTotal} of {capacity.maxTotal} total
        </p>
      </div>

      {/* Breakdown by entity type */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <BreakdownRow
          label="Leads"
          active={capacity.activeLeads}
          max={capacity.maxLeads}
          icon="target"
        />
        <BreakdownRow
          label="Contacts"
          active={capacity.activeContacts}
          max={capacity.maxContacts}
          icon="users"
        />
        <BreakdownRow
          label="Organizations"
          active={capacity.activeOrganizations}
          max={capacity.maxOrganizations}
          icon="building-2"
        />
        <BreakdownRow
          label="Quotations"
          active={capacity.activeQuotations}
          max={capacity.maxQuotations}
          icon="file-text"
        />
      </div>

      {/* Performance metrics */}
      {(capacity.avgResponseHours != null || capacity.conversionRate != null) && (
        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 8,
            borderTop: "1px solid #f3f4f6",
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          {capacity.avgResponseHours != null && (
            <span>
              Avg Response: {capacity.avgResponseHours.toFixed(1)}h
            </span>
          )}
          {capacity.conversionRate != null && (
            <span>
              Conversion: {(capacity.conversionRate * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
