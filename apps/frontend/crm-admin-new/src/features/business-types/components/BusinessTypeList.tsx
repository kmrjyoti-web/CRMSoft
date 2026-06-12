"use client";

import { useMemo } from "react";

import { Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useBusinessTypes } from "../hooks/useBusinessTypes";
import type { BusinessType } from "../types/business-types.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BusinessTypeListProps {
  onSelect?: (type: BusinessType) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BusinessTypeList({ onSelect }: BusinessTypeListProps) {
  const { data, isLoading } = useBusinessTypes();

  const types: BusinessType[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 600 }}>Business Types</h2>

      {types.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No business types available.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {types.map((bt) => (
            <Card key={bt.id}>
              <div
                onClick={() => onSelect?.(bt)}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon name={bt.icon || "briefcase"} size={20} />
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{bt.name}</h3>
                  </div>
                  <Badge variant={bt.isActive ? "success" : "secondary"}>
                    {bt.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Code */}
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
                  Code: {bt.code}
                </div>

                {/* Description */}
                {bt.description && (
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                    {bt.description}
                  </p>
                )}

                {/* Industry */}
                {bt.industry && (
                  <Badge variant="primary">{bt.industry}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
