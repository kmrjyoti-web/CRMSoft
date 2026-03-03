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

import { Button, Icon, Badge, Modal, Input, SelectInput, Switch } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useMenuTree,
  useCreateMenu,
  useUpdateMenu,
  useDeactivateMenu,
  useReorderMenus,
} from "../hooks/useMenus";

import type { MenuAdminItem, MenuType } from "../types/settings.types";

// ── Constants ────────────────────────────────────────────

const MENU_TYPE_OPTIONS = [
  { label: "Group", value: "GROUP" },
  { label: "Item", value: "ITEM" },
  { label: "Divider", value: "DIVIDER" },
];

// ── SortableMenuItem ─────────────────────────────────────

function SortableMenuItem({
  item,
  depth,
  expandedIds,
  onToggle,
  onEdit,
  onDeactivate,
}: {
  item: MenuAdminItem;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (item: MenuAdminItem) => void;
  onDeactivate: (id: string) => void;
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
    backgroundColor: "#fff",
    minHeight: 44,
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

      {/* Type badge */}
      <Badge
        variant={
          item.menuType === "GROUP"
            ? "primary"
            : item.menuType === "ITEM"
              ? "default"
              : "secondary"
        }
        style={{ marginRight: 8 }}
      >
        {item.menuType}
      </Badge>

      {/* Active indicator */}
      {!item.isActive && (
        <Badge variant="danger" style={{ marginRight: 8 }}>
          Inactive
        </Badge>
      )}

      {/* Actions */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(item)}
        style={{ marginRight: 4 }}
      >
        Edit
      </Button>
      {item.isActive && (
        <Button size="sm" variant="danger" onClick={() => onDeactivate(item.id)}>
          Deactivate
        </Button>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

/** Flatten tree to find GROUP-type items for the parent selector */
function flattenGroups(
  items: MenuAdminItem[],
  depth = 0,
): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  for (const item of items) {
    if (item.menuType === "GROUP") {
      const prefix = "\u00A0\u00A0".repeat(depth);
      result.push({ label: `${prefix}${item.name}`, value: item.id });
    }
    if (item.children && item.children.length > 0) {
      result.push(...flattenGroups(item.children, depth + 1));
    }
  }
  return result;
}

// ── MenuEditor ───────────────────────────────────────────

export function MenuEditor() {
  const { data: treeData, isLoading } = useMenuTree();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deactivateMutation = useDeactivateMenu();
  const reorderMutation = useReorderMenus();

  // ── State ──

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuAdminItem | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formRoute, setFormRoute] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formMenuType, setFormMenuType] = useState<MenuType>("ITEM");
  const [formPermModule, setFormPermModule] = useState("");
  const [formPermAction, setFormPermAction] = useState("");
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false);

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

  // ── Form reset ──

  const resetForm = useCallback(() => {
    setFormName("");
    setFormCode("");
    setFormIcon("");
    setFormRoute("");
    setFormParentId("");
    setFormMenuType("ITEM");
    setFormPermModule("");
    setFormPermAction("");
    setFormOpenInNewTab(false);
  }, []);

  // ── Open modal for add ──

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  // ── Open modal for edit ──

  const handleEdit = useCallback((item: MenuAdminItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCode(item.code ?? "");
    setFormIcon(item.icon ?? "");
    setFormRoute(item.route ?? "");
    setFormParentId(item.parentId ?? "");
    setFormMenuType(item.menuType);
    setFormPermModule(item.permissionModule ?? "");
    setFormPermAction(item.permissionAction ?? "");
    setFormOpenInNewTab(item.openInNewTab ?? false);
    setModalOpen(true);
  }, []);

  // ── Close modal ──

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
    resetForm();
  }, [resetForm]);

  // ── Deactivate ──

  const handleDeactivate = useCallback(
    async (id: string) => {
      try {
        await deactivateMutation.mutateAsync(id);
        toast.success("Menu item deactivated");
      } catch {
        toast.error("Failed to deactivate menu item");
      }
    },
    [deactivateMutation],
  );

  // ── Save (create or update) ──

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            name: formName.trim(),
            code: formCode.trim() || undefined,
            icon: formIcon.trim() || undefined,
            route: formRoute.trim() || undefined,
            parentId: formParentId || undefined,
            menuType: formMenuType,
            permissionModule: formPermModule.trim() || undefined,
            permissionAction: formPermAction.trim() || undefined,
            openInNewTab: formOpenInNewTab,
          },
        });
        toast.success("Menu item updated");
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          code: formCode.trim() || undefined,
          icon: formIcon.trim() || undefined,
          route: formRoute.trim() || undefined,
          parentId: formParentId || undefined,
          menuType: formMenuType,
          permissionModule: formPermModule.trim() || undefined,
          permissionAction: formPermAction.trim() || undefined,
          openInNewTab: formOpenInNewTab,
        });
        toast.success("Menu item created");
      }
      handleCloseModal();
    } catch {
      toast.error(
        `Failed to ${editingItem ? "update" : "create"} menu item`,
      );
    }
  }, [
    editingItem,
    formName,
    formCode,
    formIcon,
    formRoute,
    formParentId,
    formMenuType,
    formPermModule,
    formPermAction,
    formOpenInNewTab,
    createMutation,
    updateMutation,
    handleCloseModal,
  ]);

  // ── Drag end handler ──

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find the parent of both items to verify they are siblings
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
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
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
    [expandedIds, handleToggle, handleEdit, handleDeactivate],
  );

  // ── Parent options for select ──

  const parentOptions = [
    { label: "None (Root)", value: "" },
    ...flattenGroups(tree),
  ];

  // ── Loading ──

  if (isLoading) return <LoadingSpinner fullPage />;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="p-6">
      <PageHeader
        title="Menu Editor"
        actions={
          <Button variant="primary" onClick={handleAdd}>
            <Icon name="plus" size={16} /> Add Menu Item
          </Button>
        }
      />

      {/* Tree view */}
      {tree.length === 0 ? (
        <EmptyState
          icon="menu"
          title="No menu items"
          description="Get started by adding your first menu item."
          action={{ label: "Add Menu Item", onClick: handleAdd }}
        />
      ) : (
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
      )}

      {/* Modal for add/edit */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Menu item name"
              value={formName}
              onChange={(value: string) => setFormName(value)}
            />
          </div>

          {/* Code */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Code
            </label>
            <Input
              placeholder="Unique code"
              value={formCode}
              onChange={(value: string) => setFormCode(value)}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Icon
            </label>
            <Input
              placeholder="e.g. home, users, settings"
              value={formIcon}
              onChange={(value: string) => setFormIcon(value)}
            />
          </div>

          {/* Route */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Route
            </label>
            <Input
              placeholder="/path"
              value={formRoute}
              onChange={(value: string) => setFormRoute(value)}
            />
          </div>

          {/* Parent */}
          <SelectInput
            label="Parent"
            options={parentOptions}
            value={formParentId}
            onChange={(value: string | number | boolean | null) =>
              setFormParentId(String(value ?? ""))
            }
          />

          {/* Menu Type */}
          <SelectInput
            label="Type"
            options={MENU_TYPE_OPTIONS}
            value={formMenuType}
            onChange={(value: string | number | boolean | null) =>
              setFormMenuType((value as MenuType) ?? "ITEM")
            }
          />

          {/* Permission Module */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Permission Module
            </label>
            <Input
              placeholder="e.g. leads, contacts"
              value={formPermModule}
              onChange={(value: string) => setFormPermModule(value)}
            />
          </div>

          {/* Permission Action */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Permission Action
            </label>
            <Input
              placeholder="e.g. read, write, delete"
              value={formPermAction}
              onChange={(value: string) => setFormPermAction(value)}
            />
          </div>

          {/* Open in New Tab */}
          <Switch
            label="Open in new tab"
            checked={formOpenInNewTab}
            onChange={(value: boolean) => setFormOpenInNewTab(value)}
          />
        </div>
      </Modal>
    </div>
  );
}
