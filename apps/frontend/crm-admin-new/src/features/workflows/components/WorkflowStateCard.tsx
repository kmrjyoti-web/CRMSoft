"use client";

import { useSortable } from "@dnd-kit/sortable";

import { Badge, Icon } from "@/components/ui";

import type { WorkflowState } from "../types/workflows.types";

// ── Badge variant maps (shared with other workflow components) ──

export const STATE_TYPE_BADGE_VARIANT: Record<string, "success" | "primary" | "default"> = {
  INITIAL: "success",
  INTERMEDIATE: "primary",
  TERMINAL: "default",
};

export const CATEGORY_BADGE_VARIANT: Record<string, "success" | "danger" | "warning"> = {
  SUCCESS: "success",
  FAILURE: "danger",
  PAUSED: "warning",
};

// ── WorkflowStateCard ────────────────────────────────────

export function WorkflowStateCard({
  state,
  onEdit,
  onDelete,
  onAddTransitionFrom,
}: {
  state: WorkflowState;
  onEdit: (s: WorkflowState) => void;
  onDelete: (s: WorkflowState) => void;
  onAddTransitionFrom: (s: WorkflowState) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: state.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-3 transition-shadow hover:shadow-md"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-gray-300 hover:bg-gray-50 hover:text-gray-500 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Icon name="grip-vertical" size={16} />
      </button>

      {/* Color + Name */}
      <div
        className="h-8 w-8 flex-shrink-0 rounded-lg"
        style={{ backgroundColor: state.color ?? "#e2e8f0" }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{state.name}</p>
        <p className="truncate font-mono text-xs text-gray-400">{state.code}</p>
      </div>

      {/* Badges */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <Badge variant={STATE_TYPE_BADGE_VARIANT[state.stateType] ?? "default"}>
          {state.stateType}
        </Badge>
        {state.category && (
          <Badge variant={CATEGORY_BADGE_VARIANT[state.category] ?? "default"}>
            {state.category}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="Add transition from this state"
          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
          onClick={() => onAddTransitionFrom(state)}
        >
          <Icon name="arrow-right" size={14} />
        </button>
        <button
          type="button"
          title="Edit state"
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          onClick={() => onEdit(state)}
        >
          <Icon name="edit" size={14} />
        </button>
        <button
          type="button"
          title="Delete state"
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDelete(state)}
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
}

// Backward-compat alias
export { WorkflowStateCard as SortableStateCard };
