"use client";

import { useMemo } from "react";

import { Icon, Badge } from "@/components/ui";

import { useOverdueFollowUps } from "../hooks/useFollowUps";

// ── Component ───────────────────────────────────────────

export function OverdueWidget() {
  const { data, isLoading } = useOverdueFollowUps({ limit: 5 });

  const followUps = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const overdueCount = followUps.length;

  if (isLoading) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="alert-circle" size={18} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Overdue Follow-ups
            </h4>
          </div>
        </div>
        <Badge variant="danger">{overdueCount}</Badge>
      </div>

      {/* List */}
      {followUps.length === 0 ? (
        <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: 12 }}>
          No overdue follow-ups
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {followUps.map((fu) => {
            const dueDate = new Date(fu.dueDate);
            const now = new Date();
            const diffDays = Math.floor(
              (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            return (
              <div
                key={fu.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fu.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {fu.entityType}: {fu.entityName ?? fu.entityId}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500, flexShrink: 0 }}>
                  {diffDays === 1 ? "1 day ago" : `${diffDays} days ago`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* View All link */}
      {followUps.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a
            href="/follow-ups?status=overdue"
            style={{
              fontSize: 13,
              color: "#4f46e5",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View All Overdue
          </a>
        </div>
      )}
    </div>
  );
}
