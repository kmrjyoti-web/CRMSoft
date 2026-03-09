"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { usePriceGroups, useDeactivatePriceGroup } from "../hooks/usePriceGroups";
import type { CustomerPriceGroup } from "../types/price-groups.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PriceGroupListProps {
  onSelect?: (group: CustomerPriceGroup) => void;
  onCreate?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceGroupList({ onSelect, onCreate }: PriceGroupListProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePriceGroups({ search: search || undefined });
  const deactivate = useDeactivatePriceGroup();

  const groups: CustomerPriceGroup[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // ── Handlers ────────────────────────────────────────────
  function handleDeactivate(e: React.MouseEvent, group: CustomerPriceGroup) {
    e.stopPropagation();
    if (!confirm(`Deactivate price group "${group.name}"?`)) return;
    deactivate.mutate(group.id, {
      onSuccess: () => toast.success("Price group deactivated"),
      onError: () => toast.error("Failed to deactivate"),
    });
  }

  // ── Render ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Customer Price Groups</h2>
        <Button variant="primary" onClick={onCreate}>
          <Icon name="plus" size={16} /> Create Group
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "320px",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Code</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Discount%</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Member Count</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                    No price groups found
                  </td>
                </tr>
              )}
              {groups.map((group) => (
                <tr
                  key={group.id}
                  onClick={() => onSelect?.(group)}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{group.name}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{group.code}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {group.discountPercent != null ? `${group.discountPercent}%` : "\u2014"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{group.memberCount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={group.isActive ? "success" : "secondary"}>
                      {group.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {group.isActive && (
                      <Button
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => handleDeactivate(e, group)}
                        disabled={deactivate.isPending}
                      >
                        <Icon name="x-circle" size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
