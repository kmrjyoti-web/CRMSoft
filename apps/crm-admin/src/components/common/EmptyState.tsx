"use client";

import { Icon, Button } from "@/components/ui";

import type { IconName } from "@/components/ui";

interface EmptyStateProps {
  icon?: IconName;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon = "file",
  title = "No data found",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        color: "#64748b",
      }}
    >
      <Icon name={icon} size={48} color="#cbd5e1" />
      <h3
        style={{
          margin: "16px 0 4px",
          fontSize: 16,
          fontWeight: 600,
          color: "#334155",
        }}
      >
        {title}
      </h3>
      {description && (
        <p style={{ margin: "0 0 16px", fontSize: 14 }}>{description}</p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
