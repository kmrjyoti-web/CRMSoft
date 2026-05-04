"use client";

import { Button, Icon, Badge } from "@/components/ui";

import type { WorkflowState, WorkflowTransition } from "../types/workflows.types";

// ── Badge variant map ─────────────────────────────────────

const TRIGGER_BADGE_VARIANT: Record<string, "default" | "primary" | "warning" | "danger"> = {
  MANUAL: "default",
  AUTO: "primary",
  SCHEDULED: "warning",
  APPROVAL: "danger",
};

// ── WorkflowTransitionsPanel ──────────────────────────────

export function WorkflowTransitionsPanel({
  transitions,
  states,
  statesCount,
  transitionsCount,
  stateNameMap,
  onAddTransition,
  onEditTransition,
  onDeleteTransition,
}: {
  transitions: WorkflowTransition[];
  states: WorkflowState[];
  statesCount: number;
  transitionsCount: number;
  stateNameMap: Map<string, string>;
  onAddTransition: () => void;
  onEditTransition: (t: WorkflowTransition) => void;
  onDeleteTransition: (t: WorkflowTransition) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
          <Icon name="arrow-right" size={14} /> Transitions
          <Badge variant="outline">{transitionsCount}</Badge>
        </h3>
        <Button variant="primary" size="sm" onClick={onAddTransition}>
          <Icon name="plus" size={14} /> Add
        </Button>
      </div>

      {transitionsCount === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          <Icon name="arrow-right" size={24} className="mx-auto mb-2 text-gray-300" />
          <p>No transitions yet</p>
          {statesCount >= 2 && (
            <p className="mt-1 text-xs">Add transitions to connect your states</p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {transitions.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 hover:shadow-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: states.find((s) => s.id === t.fromStateId)?.color ?? "#94a3b8" }}
                />
                <span className="truncate text-xs font-medium">{stateNameMap.get(t.fromStateId) ?? "?"}</span>
                <Icon name="arrow-right" size={12} className="flex-shrink-0 text-gray-300" />
                <span
                  className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: states.find((s) => s.id === t.toStateId)?.color ?? "#94a3b8" }}
                />
                <span className="truncate text-xs font-medium">{stateNameMap.get(t.toStateId) ?? "?"}</span>
              </div>
              <Badge variant={TRIGGER_BADGE_VARIANT[t.triggerType] ?? "default"}>
                {t.triggerType}
              </Badge>
              <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  onClick={() => onEditTransition(t)}
                >
                  <Icon name="edit" size={12} />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDeleteTransition(t)}
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
