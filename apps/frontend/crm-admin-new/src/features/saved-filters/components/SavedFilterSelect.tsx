"use client";

import { useMemo, useCallback } from "react";

import { Icon, Button, Badge } from "@/components/ui";

import {
  useEntityFilters,
  useRemoveFilter,
} from "../hooks/useSavedFilters";

import type { SavedFilter } from "../types/saved-filters.types";

// ── Props ───────────────────────────────────────────────

interface SavedFilterSelectProps {
  entityType: string;
  entityId: string;
  onApply?: (filters: unknown[]) => void;
}

// ── Component ───────────────────────────────────────────

export function SavedFilterSelect({
  entityType,
  entityId,
  onApply,
}: SavedFilterSelectProps) {
  const { data, isLoading } = useEntityFilters(entityType, entityId);
  const removeFilter = useRemoveFilter();

  const filters = useMemo(() => {
    const raw = data?.data ?? data;
    return (Array.isArray(raw) ? raw : []) as SavedFilter[];
  }, [data]);

  const handleRemove = useCallback(
    (lookupValueId: string) => {
      removeFilter.mutate(
        { entityType, entityId, lookupValueId },
        {
          onSuccess: () => {
            // Re-apply remaining filters
            const remaining = filters.filter((f) => f.id !== lookupValueId);
            onApply?.(remaining);
          },
        },
      );
    },
    [removeFilter, entityType, entityId, filters, onApply],
  );

  const handleApplyAll = useCallback(() => {
    onApply?.(filters);
  }, [filters, onApply]);

  if (isLoading) {
    return (
      <div style={{ fontSize: 13, color: "#9ca3af" }}>Loading filters...</div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {/* Filter chips */}
      {filters.map((filter) => (
        <div
          key={filter.id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 16,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: 12,
            color: "#1e40af",
          }}
        >
          <span>{filter.name}</span>
          <button
            type="button"
            onClick={() => handleRemove(filter.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
            title="Remove filter"
          >
            <Icon name="x" size={12} color="#3b82f6" />
          </button>
        </div>
      ))}

      {/* Add filter button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleApplyAll}
        title="Apply all filters"
      >
        <Icon name="plus" size={14} />
        Add Filter
      </Button>

      {/* Summary badge */}
      {filters.length > 0 && (
        <Badge variant="secondary">{filters.length} filter{filters.length !== 1 ? "s" : ""}</Badge>
      )}
    </div>
  );
}
