"use client";

import { useState, useMemo, useCallback } from "react";

import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useBusinessLocations, useLocationTree } from "../hooks/useBusinessLocations";
import type { BusinessLocation } from "../types/business-locations.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LocationListProps {
  onSelect?: (location: BusinessLocation) => void;
  onCreate?: (parentId?: string) => void;
}

// ---------------------------------------------------------------------------
// Type badge color map
// ---------------------------------------------------------------------------

const TYPE_VARIANT: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  HEAD_OFFICE: "primary",
  BRANCH: "success",
  WAREHOUSE: "warning",
  FACTORY: "secondary",
  STORE: "default",
  OTHER: "default",
};

// ---------------------------------------------------------------------------
// Tree Node
// ---------------------------------------------------------------------------

function LocationNode({
  node,
  depth,
  expanded,
  onToggle,
  onSelect,
  onCreate,
}: {
  node: BusinessLocation;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (loc: BusinessLocation) => void;
  onCreate?: (parentId?: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          paddingLeft: `${16 + depth * 28}px`,
          borderBottom: "1px solid #f3f4f6",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => onSelect?.(node)}
      >
        {/* Expand/Collapse */}
        <div
          style={{ width: "24px", flexShrink: 0, display: "flex", alignItems: "center" }}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
        >
          {hasChildren && (
            <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={16} />
          )}
        </div>

        {/* Location Icon */}
        <div style={{ marginRight: "10px", color: "#6b7280" }}>
          <Icon name="map-pin" size={16} />
        </div>

        {/* Name & Code */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 500, fontSize: "14px" }}>{node.name}</span>
          <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "8px" }}>{node.code}</span>
        </div>

        {/* Type Badge */}
        <div style={{ marginRight: "12px" }}>
          <Badge variant={TYPE_VARIANT[node.type] ?? "default"}>{node.type.replace(/_/g, " ")}</Badge>
        </div>

        {/* City/State */}
        <div style={{ color: "#6b7280", fontSize: "13px", minWidth: "140px" }}>
          {[node.city, node.state].filter(Boolean).join(", ") || "\u2014"}
        </div>

        {/* Add child */}
        <Button
          variant="ghost"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onCreate?.(node.id);
          }}
        >
          <Icon name="plus" size={14} />
        </Button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && node.children!.map((child) => (
        <LocationNode
          key={child.id}
          node={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
          onCreate={onCreate}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function LocationList({ onSelect, onCreate }: LocationListProps) {
  const { data: treeData, isLoading: treeLoading } = useLocationTree();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree: BusinessLocation[] = useMemo(() => {
    const raw = treeData?.data ?? treeData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [treeData]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (treeLoading) {
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
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Business Locations</h2>
        <Button variant="primary" onClick={() => onCreate?.()}>
          <Icon name="plus" size={16} /> Add Location
        </Button>
      </div>

      {/* Tree */}
      <Card>
        {tree.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No locations configured. Click "Add Location" to get started.
          </div>
        ) : (
          tree.map((node) => (
            <LocationNode
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={toggleExpand}
              onSelect={onSelect}
              onCreate={onCreate}
            />
          ))
        )}
      </Card>
    </div>
  );
}
