"use client";

import { useCallback } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Switch, Icon } from "@/components/ui";

import type { ColumnConfig } from "../types/table-config.types";

// ── Sortable row ──────────────────────────────────────

interface SortableRowProps {
  column: ColumnConfig;
  onToggleVisible: (id: string) => void;
  onRename: (id: string, label: string) => void;
}

function SortableRow({ column, onToggleVisible, onRename }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-white"
    >
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <Icon name="grip-vertical" size={16} />
      </button>

      <Switch
        size="sm"
        checked={column.visible}
        onChange={() => onToggleVisible(column.id)}
      />

      <input
        type="text"
        value={column.label ?? column.id}
        onChange={(e) => onRename(column.id, e.target.value)}
        className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-300 rounded px-1"
      />
    </div>
  );
}

// ── Main list ─────────────────────────────────────────

interface ColumnConfigListProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

export function ColumnConfigList({ columns, onChange }: ColumnConfigListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(columns, oldIndex, newIndex).map(
        (c, idx) => ({ ...c, order: idx }),
      );
      onChange(reordered);
    },
    [columns, onChange],
  );

  const handleToggleVisible = useCallback(
    (id: string) => {
      onChange(
        columns.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
      );
    },
    [columns, onChange],
  );

  const handleRename = useCallback(
    (id: string, label: string) => {
      onChange(columns.map((c) => (c.id === id ? { ...c, label } : c)));
    },
    [columns, onChange],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {columns.map((col) => (
            <SortableRow
              key={col.id}
              column={col}
              onToggleVisible={handleToggleVisible}
              onRename={handleRename}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
