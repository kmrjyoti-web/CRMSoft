"use client";

import { useState, useCallback } from "react";

import toast from "react-hot-toast";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { Button, Icon, Badge, Switch } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useMenuTree,
  useUpdateMenu,
  useReorderMenus,
} from "../hooks/useMenus";

import type { MenuAdminItem } from "../types/settings.types";

// ── SortableMenuItem ─────────────────────────────────────

function SortableMenuItem({
  item,
  depth,
  expandedIds,
  onToggle,
  onToggleVisibility,
}: {
  item: MenuAdminItem;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleVisibility: (id: string, isActive: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    paddingLeft: depth * 24 + 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: item.isActive ? "#fff" : "#fafafa",
    minHeight: 44,
    opacity: item.isActive ? 1 : 0.6,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle */}
      <span
        {...listeners}
        style={{ cursor: "grab", marginRight: 8, color: "#94a3b8" }}
      >
        <Icon name="grip-vertical" size={16} />
      </span>

      {/* Expand/collapse */}
      {hasChildren ? (
        <button
          onClick={() => onToggle(item.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            marginRight: 4,
            display: "inline-flex",
            alignItems: "center",
            color: "#64748b",
          }}
        >
          <Icon
            name={isExpanded ? "chevron-down" : "chevron-right"}
            size={14}
          />
        </button>
      ) : (
        <span style={{ width: 22 }} />
      )}

      {/* Icon */}
      {item.icon && (
        <span style={{ marginRight: 8, color: "#64748b", display: "inline-flex" }}>
          <Icon name={item.icon as any} size={16} />
        </span>
      )}

      {/* Name */}
      <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>
        {item.name}
      </span>

      {/* Route (read-only) */}
      {item.route && (
        <span
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginRight: 8,
            fontFamily: "monospace",
          }}
        >
          {item.route}
        </span>
      )}

      {/* Type badge */}
      <Badge
        variant={
          item.menuType === "GROUP"
            ? "primary"
            : item.menuType === "ITEM"
              ? "default"
              : "secondary"
        }
        style={{ marginRight: 12 }}
      >
        {item.menuType}
      </Badge>

      {/* Visibility toggle */}
      {item.menuType !== "DIVIDER" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {item.isActive ? "Visible" : "Hidden"}
          </span>
          <Switch
            checked={item.isActive}
            onChange={(checked: boolean) => onToggleVisibility(item.id, checked)}
          />
        </div>
      )}
    </div>
  );
}

// ── MenuEditor (Menu Preferences) ────────────────────────

export function MenuEditor() {
  const { data: treeData, isLoading } = useMenuTree();
  const updateMutation = useUpdateMenu();
  const reorderMutation = useReorderMenus();

  // ── State ──

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ── DnD sensors ──

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // ── Tree data ──

  const tree: MenuAdminItem[] = treeData?.data ?? [];

  // ── Toggle expand/collapse ──

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Toggle visibility ──

  const handleToggleVisibility = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await updateMutation.mutateAsync({
          id,
          data: { isActive },
        });
        toast.success(isActive ? "Menu item shown" : "Menu item hidden");
      } catch {
        toast.error("Failed to update visibility");
      }
    },
    [updateMutation],
  );

  // ── Drag end handler ──

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      function findParentAndSiblings(
        items: MenuAdminItem[],
        parentId?: string,
      ): { parentId?: string; siblings: MenuAdminItem[] } | null {
        const activeInLevel = items.find((i) => i.id === activeId);
        const overInLevel = items.find((i) => i.id === overId);

        if (activeInLevel && overInLevel) {
          return { parentId, siblings: items };
        }

        for (const item of items) {
          if (item.children && item.children.length > 0) {
            const found = findParentAndSiblings(item.children, item.id);
            if (found) return found;
          }
        }

        return null;
      }

      const result = findParentAndSiblings(tree);
      if (!result) return;

      const { parentId, siblings } = result;
      const ids = siblings.map((s) => s.id);
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const orderedIds = arrayMove(ids, oldIndex, newIndex);

      reorderMutation.mutate({
        parentId,
        orderedIds,
      });
    },
    [tree, reorderMutation],
  );

  // ── Recursive tree renderer ──

  const renderTree = useCallback(
    (items: MenuAdminItem[], depth: number) => {
      const ids = items.map((i) => i.id);

      return (
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <div key={item.id}>
              <SortableMenuItem
                item={item}
                depth={depth}
                expandedIds={expandedIds}
                onToggle={handleToggle}
                onToggleVisibility={handleToggleVisibility}
              />
              {item.children &&
                item.children.length > 0 &&
                expandedIds.has(item.id) &&
                renderTree(item.children, depth + 1)}
            </div>
          ))}
        </SortableContext>
      );
    },
    [expandedIds, handleToggle, handleToggleVisibility],
  );

  // ── Loading ──

  if (isLoading) return <LoadingSpinner fullPage />;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="p-6">
      <PageHeader
        title="Menu Preferences"
        subtitle="Customize menu order and visibility for your team. Contact your vendor to add or modify menu items."
      />

      {/* Tree view */}
      {tree.length === 0 ? (
        <EmptyState
          icon="menu"
          title="No menu items"
          description="Menu items will appear here once configured by your vendor."
        />
      ) : (
        <>
          <div
            className="mb-3 flex items-center gap-2 text-sm text-gray-500"
          >
            <Icon name="info" size={14} />
            <span>Drag items to reorder. Use the toggle to show or hide menu items.</span>
          </div>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {renderTree(tree, 0)}
            </DndContext>
          </div>
        </>
      )}
    </div>
  );
}
