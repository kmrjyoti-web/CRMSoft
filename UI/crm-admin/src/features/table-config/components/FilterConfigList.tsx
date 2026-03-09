"use client";

import { useState, useCallback } from "react";

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

import { Icon } from "@/components/ui";

import type { FilterLayoutSection } from "../types/table-config.types";

// ── Types ──────────────────────────────────────────────

interface FilterDef {
  columnId: string;
  label: string;
  filterType: string;
}

interface FilterConfigListProps {
  /** All available filters (from filterConfig) */
  allFilters: FilterDef[];
  /** Current layout (sections with filter IDs) */
  layout: FilterLayoutSection[];
  /** Current visibility map */
  visibility: Record<string, boolean>;
  /** Whether a filter is visible by default (static config) */
  defaultFilterIds: Set<string>;
  onLayoutChange: (layout: FilterLayoutSection[]) => void;
  onVisibilityChange: (visibility: Record<string, boolean>) => void;
}

// ── Sortable filter row ────────────────────────────────

interface SortableFilterRowProps {
  filter: FilterDef;
  checked: boolean;
  sections: string[];
  currentSection: string;
  onToggle: () => void;
  onGroupChange: (newGroup: string) => void;
}

function SortableFilterRow({
  filter,
  checked,
  sections,
  currentSection,
  onToggle,
  onGroupChange,
}: SortableFilterRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.columnId });

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
      className="flex items-center gap-2 py-1.5 px-2 rounded border border-gray-100 bg-white"
    >
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-600 shrink-0"
        {...attributes}
        {...listeners}
      >
        <Icon name="grip-vertical" size={14} />
      </button>

      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="rounded border-gray-300 text-blue-600 shrink-0"
      />

      <span className="text-sm text-gray-700 flex-1 truncate min-w-0">
        {filter.label}
      </span>

      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded shrink-0">
        {filter.filterType}
      </span>

      <select
        value={currentSection}
        onChange={(e) => onGroupChange(e.target.value)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white shrink-0 max-w-[100px]"
      >
        {sections.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main component ─────────────────────────────────────

export function FilterConfigList({
  allFilters,
  layout,
  visibility,
  defaultFilterIds,
  onLayoutChange,
  onVisibilityChange,
}: FilterConfigListProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Build lookup: columnId → FilterDef
  const filterMap = new Map(allFilters.map((f) => [f.columnId, f]));
  const sectionTitles = layout.map((s) => s.title);

  const isChecked = useCallback(
    (columnId: string) => {
      const isDefault = defaultFilterIds.has(columnId);
      return isDefault
        ? visibility[columnId] !== false
        : visibility[columnId] === true;
    },
    [defaultFilterIds, visibility],
  );

  const handleToggle = useCallback(
    (columnId: string) => {
      const current = isChecked(columnId);
      onVisibilityChange({ ...visibility, [columnId]: !current });
    },
    [isChecked, visibility, onVisibilityChange],
  );

  const handleDragEnd = useCallback(
    (sectionIdx: number) => (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const section = layout[sectionIdx];
      const oldIndex = section.filterIds.indexOf(String(active.id));
      const newIndex = section.filterIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const newFilterIds = arrayMove(section.filterIds, oldIndex, newIndex);
      const newLayout = layout.map((s, i) =>
        i === sectionIdx ? { ...s, filterIds: newFilterIds } : s,
      );
      onLayoutChange(newLayout);
    },
    [layout, onLayoutChange],
  );

  const handleGroupChange = useCallback(
    (columnId: string, newGroup: string) => {
      const newLayout = layout.map((s) => ({
        ...s,
        filterIds: s.title === newGroup
          ? s.filterIds.includes(columnId)
            ? s.filterIds
            : [...s.filterIds, columnId]
          : s.filterIds.filter((id) => id !== columnId),
      }));
      // Remove empty sections (except if they were just created)
      onLayoutChange(newLayout.filter((s) => s.filterIds.length > 0 || !sectionTitles.includes(s.title)));
    },
    [layout, sectionTitles, onLayoutChange],
  );

  const handleAddGroup = useCallback(() => {
    const name = newGroupName.trim();
    if (!name || sectionTitles.includes(name)) return;
    onLayoutChange([...layout, { title: name, filterIds: [] }]);
    setNewGroupName("");
    setShowNewGroup(false);
  }, [newGroupName, sectionTitles, layout, onLayoutChange]);

  const handleRemoveSection = useCallback(
    (sectionIdx: number) => {
      const section = layout[sectionIdx];
      if (section.filterIds.length === 0) {
        onLayoutChange(layout.filter((_, i) => i !== sectionIdx));
      }
    },
    [layout, onLayoutChange],
  );

  return (
    <div className="space-y-4">
      {layout.map((section, sectionIdx) => (
        <div key={section.title}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {section.title}
            </p>
            {section.filterIds.length === 0 && (
              <button
                type="button"
                onClick={() => handleRemoveSection(sectionIdx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd(sectionIdx)}
          >
            <SortableContext
              items={section.filterIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1 pl-1">
                {section.filterIds.map((filterId) => {
                  const def = filterMap.get(filterId);
                  if (!def) return null;
                  return (
                    <SortableFilterRow
                      key={filterId}
                      filter={def}
                      checked={isChecked(filterId)}
                      sections={sectionTitles}
                      currentSection={section.title}
                      onToggle={() => handleToggle(filterId)}
                      onGroupChange={(g) => handleGroupChange(filterId, g)}
                    />
                  );
                })}
                {section.filterIds.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-2 pl-2">
                    No filters in this group. Drag filters here or remove.
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ))}

      {/* Add Group */}
      {showNewGroup ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            placeholder="Group name..."
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddGroup}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowNewGroup(false); setNewGroupName(""); }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewGroup(true)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Icon name="plus" size={14} />
          Create Group
        </button>
      )}
    </div>
  );
}
