"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SensorDescriptor, SensorOptions } from "@dnd-kit/core";

import { Button, Icon, Badge } from "@/components/ui";

import { WorkflowStateCard } from "./WorkflowStateCard";

import type { WorkflowState } from "../types/workflows.types";

// ── WorkflowStatesPanel ───────────────────────────────────

export function WorkflowStatesPanel({
  sortedStates,
  statesCount,
  sensors,
  onDragEnd,
  onAddState,
  onEditState,
  onDeleteState,
  onAddTransitionFrom,
}: {
  sortedStates: WorkflowState[];
  statesCount: number;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => Promise<void>;
  onAddState: () => void;
  onEditState: (s: WorkflowState) => void;
  onDeleteState: (s: WorkflowState) => void;
  onAddTransitionFrom: (s: WorkflowState) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
          <Icon name="layers" size={14} /> States
          <Badge variant="outline">{statesCount}</Badge>
        </h3>
        <Button variant="primary" size="sm" onClick={onAddState}>
          <Icon name="plus" size={14} /> Add State
        </Button>
      </div>

      {statesCount === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          <Icon name="layers" size={24} className="mx-auto mb-2 text-gray-300" />
          <p>No states yet</p>
        </div>
      ) : (
        <>
          <p className="mb-2 text-[11px] text-gray-400">
            <Icon name="grip-vertical" size={10} className="mr-0.5 inline text-gray-300" />
            Drag to reorder
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={sortedStates.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {sortedStates.map((s) => (
                  <WorkflowStateCard
                    key={s.id}
                    state={s}
                    onEdit={onEditState}
                    onDelete={onDeleteState}
                    onAddTransitionFrom={onAddTransitionFrom}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
