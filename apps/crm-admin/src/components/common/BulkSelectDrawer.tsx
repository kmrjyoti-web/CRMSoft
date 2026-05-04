"use client";

import { useState, useMemo } from "react";

import { Button, Icon, Checkbox, Input } from "@/components/ui";

import { useBulkSelect } from "@/hooks/useBulkSelect";

export interface BulkSelectItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface BulkSelectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BulkSelectItem[];
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkEdit?: (ids: string[]) => void;
  entityName?: string;
  isDeleting?: boolean;
}

/**
 * Fixed right-side drawer for searching and selecting records for bulk operations.
 * Receives the parent's already-fetched (possibly filtered) item list.
 */
export function BulkSelectDrawer({
  isOpen,
  onClose,
  items,
  onBulkDelete,
  onBulkEdit,
  entityName = "record",
  isDeleting = false,
}: BulkSelectDrawerProps) {
  const [search, setSearch] = useState("");
  const { selectedIds, isSelected, toggle, selectAll, clearSelection, count } =
    useBulkSelect();

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const allFilteredIds = useMemo(() => filtered.map((i) => i.id), [filtered]);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => isSelected(id));

  const handleSelectAll = (_checked?: boolean) => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(allFilteredIds);
    }
  };

  const handleBulkDelete = async () => {
    await onBulkDelete(Array.from(selectedIds));
    clearSelection();
    onClose();
  };

  const handleBulkEdit = () => {
    if (onBulkEdit) {
      onBulkEdit(Array.from(selectedIds));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 98,
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          background: "#fff",
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              Bulk Actions
            </h3>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              {items.length} {entityName}{items.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <Input
            placeholder={`Search ${entityName}s...`}
            value={search}
            onChange={(v) => setSearch(v)}
          />
        </div>

        {/* Select All row */}
        <div
          style={{
            padding: "8px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f9fafb",
          }}
        >
          <Checkbox
            label={allSelected ? "Deselect all" : `Select all ${filtered.length}`}
            checked={allSelected}
            onChange={handleSelectAll}
          />
          {count > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              {count} selected
            </span>
          )}
        </div>

        {/* Item list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filtered.length === 0 ? (
            <p style={{ padding: "24px 20px", color: "#9ca3af", textAlign: "center", fontSize: 13 }}>
              No {entityName}s found
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  cursor: "pointer",
                  background: isSelected(item.id) ? "#eef2ff" : "transparent",
                  borderBottom: "1px solid #f9fafb",
                }}
                onClick={() => toggle(item.id)}
              >
                <Checkbox
                  checked={isSelected(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.label}
                  </p>
                  {item.subtitle && (
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 8,
            background: "#f9fafb",
          }}
        >
          {count > 0 && onBulkEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEdit}
              disabled={isDeleting}
            >
              <Icon name="edit" size={14} /> Edit {count}
            </Button>
          )}
          {count > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              <Icon name="trash-2" size={14} /> Delete {count}
            </Button>
          )}
          {count === 0 && (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "auto 0" }}>
              Select records to perform bulk actions
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={count === 0 || isDeleting}
            style={{ marginLeft: "auto" }}
          >
            Clear
          </Button>
        </div>
      </div>
    </>
  );
}
