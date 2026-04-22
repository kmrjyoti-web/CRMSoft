"use client";

import { useState, useMemo, useCallback } from "react";

import {
  Icon,
  Button,
  Badge,
  Modal,
  Input,
  SelectInput,
} from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";

import {
  useEntityFilters,
  useAssignFilters,
  useReplaceFilters,
  useCopyFilters,
} from "../hooks/useSavedFilters";

import type { SavedFilter } from "../types/saved-filters.types";

// ── Props ───────────────────────────────────────────────

interface FilterManagerProps {
  entityType: string;
  entityId: string;
}

// ── Component ───────────────────────────────────────────

export function FilterManager({ entityType, entityId }: FilterManagerProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [newFilterIds, setNewFilterIds] = useState<string[]>([]);
  const [copyTargetType, setCopyTargetType] = useState(entityType);
  const [copyTargetId, setCopyTargetId] = useState("");

  const { data, isLoading } = useEntityFilters(entityType, entityId);
  const assignFilters = useAssignFilters();
  const replaceFilters = useReplaceFilters();
  const copyFilters = useCopyFilters();

  const filters = useMemo(() => {
    const raw = data?.data ?? data;
    return (Array.isArray(raw) ? raw : []) as SavedFilter[];
  }, [data]);

  // ── Group filters by a simple category (first letter or name prefix) ──

  const groupedFilters = useMemo(() => {
    const groups: Record<string, SavedFilter[]> = {};
    for (const filter of filters) {
      const category = filter.entityType || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(filter);
    }
    return groups;
  }, [filters]);

  // ── Assign handler ────────────────────────────────────

  const handleAssign = useCallback(() => {
    if (newFilterIds.length === 0) return;
    assignFilters.mutate(
      {
        entityType,
        entityId,
        dto: { lookupValueIds: newFilterIds },
      },
      {
        onSuccess: () => {
          setAssignModalOpen(false);
          setNewFilterIds([]);
        },
      },
    );
  }, [assignFilters, entityType, entityId, newFilterIds]);

  // ── Copy handler ──────────────────────────────────────

  const handleCopy = useCallback(() => {
    if (!copyTargetId) return;
    copyFilters.mutate(
      {
        entityType,
        entityId,
        dto: {
          targetEntityType: copyTargetType,
          targetEntityId: copyTargetId,
        },
      },
      {
        onSuccess: () => {
          setCopyModalOpen(false);
          setCopyTargetId("");
        },
      },
    );
  }, [copyFilters, entityType, entityId, copyTargetType, copyTargetId]);

  // ── Toggle filter ID in selection ─────────────────────

  const toggleFilterId = useCallback((id: string) => {
    setNewFilterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  return (
    <div>
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
          <Icon name="filter" size={18} color="#374151" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
            Assigned Filters
          </span>
          {filters.length > 0 && (
            <Badge variant="secondary">{filters.length}</Badge>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCopyModalOpen(true)}
            disabled={filters.length === 0}
          >
            <Icon name="copy" size={14} />
            Copy Filters
          </Button>
          <Button size="sm" onClick={() => setAssignModalOpen(true)}>
            <Icon name="plus" size={14} />
            Assign Filters
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
          Loading filters...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filters.length === 0 && (
        <EmptyState
          icon="filter"
          title="No Filters Assigned"
          description="Assign lookup values as filters to this entity."
          action={{ label: "Assign Filters", onClick: () => setAssignModalOpen(true) }}
        />
      )}

      {/* Grouped Filters */}
      {!isLoading && filters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(groupedFilters).map(([category, items]) => (
            <div
              key={category}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 10,
                }}
              >
                {category}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {items.map((filter) => (
                  <div
                    key={filter.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      fontSize: 13,
                      color: "#166534",
                    }}
                  >
                    <Icon name="check-circle" size={14} color="#22c55e" />
                    <span>{filter.name}</span>
                    {filter.isPublic && (
                      <Icon name="globe" size={12} color="#9ca3af" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Filters Modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setNewFilterIds([]);
        }}
        title="Assign Filters"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Enter lookup value IDs to assign as filters to this entity.
          </p>

          {/* Simple multi-select via input tags */}
          <Input
            label="Filter IDs"
            leftIcon={<Icon name="filter" size={16} />}
            placeholder="Enter filter ID and press Enter"
            value=""
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !newFilterIds.includes(val)) {
                  toggleFilterId(val);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />

          {/* Selected IDs */}
          {newFilterIds.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {newFilterIds.map((id) => (
                <div
                  key={id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 12,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    fontSize: 12,
                    color: "#1e40af",
                  }}
                >
                  {id}
                  <button
                    type="button"
                    onClick={() => toggleFilterId(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <Icon name="x" size={12} color="#3b82f6" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 16,
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setAssignModalOpen(false);
                setNewFilterIds([]);
              }}
              disabled={assignFilters.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={newFilterIds.length === 0 || assignFilters.isPending}
            >
              <Icon name="check" size={14} />
              {assignFilters.isPending ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Copy Filters Modal */}
      <Modal
        open={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false);
          setCopyTargetId("");
        }}
        title="Copy Filters to Another Entity"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20 }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Copy all assigned filters from this entity to another entity.
          </p>

          <SelectInput
            label="Target Entity Type"
            leftIcon={<Icon name="database" size={16} />}
            options={[
              { label: "Lead", value: "lead" },
              { label: "Contact", value: "contact" },
              { label: "Organization", value: "organization" },
              { label: "Quotation", value: "quotation" },
              { label: "Product", value: "product" },
            ]}
            value={copyTargetType}
            onChange={(v) => setCopyTargetType(v as string)}
          />

          <Input
            label="Target Entity ID"
            leftIcon={<Icon name="hash" size={16} />}
            placeholder="Enter the target entity ID"
            value={copyTargetId}
            onChange={(v) => setCopyTargetId(v as string)}
          />

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 16,
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setCopyModalOpen(false);
                setCopyTargetId("");
              }}
              disabled={copyFilters.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!copyTargetId || copyFilters.isPending}
            >
              <Icon name="copy" size={14} />
              {copyFilters.isPending ? "Copying..." : "Copy Filters"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
