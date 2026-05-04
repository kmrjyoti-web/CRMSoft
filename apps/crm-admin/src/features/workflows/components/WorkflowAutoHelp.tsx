"use client";

import { useMemo } from "react";

import { Icon, Badge } from "@/components/ui";

import type {
  WorkflowState,
  WorkflowTransition,
  WorkflowDetail,
} from "../types/workflows.types";

// ── Props ───────────────────────────────────────────────

interface WorkflowAutoHelpContentProps {
  workflow: WorkflowDetail;
}

// ── Helpers ─────────────────────────────────────────────

const STATE_TYPE_LABEL: Record<string, string> = {
  INITIAL: "Starting Point",
  INTERMEDIATE: "In-Progress",
  TERMINAL: "End State",
};

const CATEGORY_LABEL: Record<string, string> = {
  SUCCESS: "Success",
  FAILURE: "Failure",
  PAUSED: "Paused",
};

const TRIGGER_LABEL: Record<string, string> = {
  MANUAL: "User clicks a button",
  AUTO: "Happens automatically",
  SCHEDULED: "Triggers at scheduled time",
  APPROVAL: "Requires approval",
};

const TRIGGER_VARIANT: Record<string, "default" | "primary" | "warning" | "danger"> = {
  MANUAL: "default",
  AUTO: "primary",
  SCHEDULED: "warning",
  APPROVAL: "danger",
};

const STATE_TYPE_VARIANT: Record<string, "success" | "primary" | "default"> = {
  INITIAL: "success",
  INTERMEDIATE: "primary",
  TERMINAL: "default",
};

function darkenColor(hex: string): string {
  try {
    const cleaned = hex.replace("#", "");
    const r = Math.max(0, parseInt(cleaned.substring(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(cleaned.substring(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(cleaned.substring(4, 6), 16) - 40);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return "#94a3b8";
  }
}

// ── Mini Diagram ────────────────────────────────────────

const MINI_W = 110;
const MINI_H = 44;
const MINI_COL_GAP = 40;
const MINI_ROW_GAP = 30;
const MINI_PAD = 20;
const MINI_COLS = 4;

function MiniDiagram({
  states,
  transitions,
}: {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}) {
  const sorted = useMemo(
    () => [...states].sort((a, b) => a.sortOrder - b.sortOrder),
    [states],
  );

  const layout = useMemo(() => {
    const nodes = sorted.map((s, idx) => ({
      id: s.id,
      label: s.name,
      color: s.color ?? "#94a3b8",
      stateType: s.stateType,
      x: MINI_PAD + (idx % MINI_COLS) * (MINI_W + MINI_COL_GAP),
      y: MINI_PAD + Math.floor(idx / MINI_COLS) * (MINI_H + MINI_ROW_GAP),
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const edges = transitions
      .map((t) => {
        const src = nodeMap.get(t.fromStateId);
        const tgt = nodeMap.get(t.toStateId);
        if (!src || !tgt) return null;
        return { id: t.id, src, tgt };
      })
      .filter(Boolean) as Array<{
        id: string;
        src: (typeof nodes)[0];
        tgt: (typeof nodes)[0];
      }>;

    const totalRows = Math.ceil(sorted.length / MINI_COLS);
    const totalCols = Math.min(sorted.length, MINI_COLS);
    const w = MINI_PAD * 2 + totalCols * MINI_W + Math.max(0, totalCols - 1) * MINI_COL_GAP;
    const h = MINI_PAD * 2 + totalRows * MINI_H + Math.max(0, totalRows - 1) * MINI_ROW_GAP;

    return { nodes, edges, w, h };
  }, [sorted, transitions]);

  if (layout.nodes.length === 0) return null;

  return (
    <svg
      width={Math.max(layout.w, 400)}
      height={Math.max(layout.h, 120)}
      viewBox={`0 0 ${Math.max(layout.w, 400)} ${Math.max(layout.h, 120)}`}
      className="select-none"
    >
      <defs>
        <marker id="ah-mini" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Edges */}
      {layout.edges.map((e) => {
        const sx = e.src.x + MINI_W / 2;
        const sy = e.src.y + MINI_H / 2;
        const tx = e.tgt.x + MINI_W / 2;
        const ty = e.tgt.y + MINI_H / 2;
        const dx = tx - sx;
        const dy = ty - sy;

        let x1: number, y1: number, x2: number, y2: number;
        if (Math.abs(dx) > Math.abs(dy)) {
          x1 = dx > 0 ? e.src.x + MINI_W : e.src.x;
          y1 = sy;
          x2 = dx > 0 ? e.tgt.x : e.tgt.x + MINI_W;
          y2 = ty;
        } else {
          x1 = sx;
          y1 = dy > 0 ? e.src.y + MINI_H : e.src.y;
          x2 = tx;
          y2 = dy > 0 ? e.tgt.y : e.tgt.y + MINI_H;
        }

        return (
          <line
            key={e.id}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#cbd5e1"
            strokeWidth={1}
            markerEnd="url(#ah-mini)"
          />
        );
      })}

      {/* Nodes */}
      {layout.nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x} y={n.y}
            width={MINI_W} height={MINI_H}
            rx={8}
            fill={n.color}
            stroke={darkenColor(n.color)}
            strokeWidth={1.5}
          />
          <text
            x={n.x + MINI_W / 2}
            y={n.y + MINI_H / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={10}
            fontWeight={600}
          >
            {n.label.length > 14 ? `${n.label.slice(0, 13)}...` : n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Component ───────────────────────────────────────────

export function WorkflowAutoHelpContent({ workflow }: WorkflowAutoHelpContentProps) {
  const sortedStates = useMemo(
    () => [...workflow.states].sort((a, b) => a.sortOrder - b.sortOrder),
    [workflow.states],
  );

  const stateMap = useMemo(() => {
    const map = new Map<string, WorkflowState>();
    workflow.states.forEach((s) => map.set(s.id, s));
    return map;
  }, [workflow.states]);

  // Group transitions by fromState
  const transitionsByState = useMemo(() => {
    const map = new Map<string, WorkflowTransition[]>();
    workflow.transitions.forEach((t) => {
      const list = map.get(t.fromStateId) ?? [];
      list.push(t);
      map.set(t.fromStateId, list);
    });
    return map;
  }, [workflow.transitions]);

  const initialState = sortedStates.find((s) => s.stateType === "INITIAL");
  const terminalStates = sortedStates.filter((s) => s.stateType === "TERMINAL");
  const intermediateStates = sortedStates.filter((s) => s.stateType === "INTERMEDIATE");
  const approvalTransitions = workflow.transitions.filter((t) => t.triggerType === "APPROVAL");
  const autoTransitions = workflow.transitions.filter((t) => t.triggerType === "AUTO");

  return (
    <div className="p-6">
      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Badge variant={workflow.isPublished ? "success" : "warning"}>
            {workflow.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          Auto-generated documentation for this {workflow.entityType.toLowerCase()} workflow
        </p>
      </div>

      <div className="space-y-7 text-sm text-gray-600">

        {/* ─── Overview Card ─── */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-blue-700">Workflow Code</span>
              <p className="mt-0.5 font-mono font-semibold text-blue-900">{workflow.code}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Entity Type</span>
              <p className="mt-0.5 font-semibold text-blue-900">{workflow.entityType}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Total States</span>
              <p className="mt-0.5 font-semibold text-blue-900">{workflow.states.length}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Total Transitions</span>
              <p className="mt-0.5 font-semibold text-blue-900">{workflow.transitions.length}</p>
            </div>
            {workflow.description && (
              <div className="col-span-2">
                <span className="font-medium text-blue-700">Description</span>
                <p className="mt-0.5 text-blue-900">{workflow.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── 1. Visual Diagram ─── */}
        {sortedStates.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <Icon name="monitor" size={14} className="text-blue-600" />
              </span>
              Workflow Diagram
            </h3>
            <div className="overflow-auto rounded-lg border border-gray-100 bg-slate-50 p-2">
              <MiniDiagram states={sortedStates} transitions={workflow.transitions} />
            </div>
          </section>
        )}

        {/* ─── 2. Pipeline Flow ─── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
              <Icon name="activity" size={14} className="text-green-600" />
            </span>
            Pipeline Flow
          </h3>
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
            {sortedStates.map((s, idx) => (
              <span key={s.id} className="flex items-center gap-1 whitespace-nowrap">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: s.color ?? "#94a3b8" }}
                >
                  {s.name}
                </span>
                {idx < sortedStates.length - 1 && (
                  <Icon name="chevron-right" size={12} className="text-gray-300" />
                )}
              </span>
            ))}
          </div>
          {initialState && (
            <p className="mt-2 text-xs text-gray-500">
              New {workflow.entityType.toLowerCase()}s start at{" "}
              <strong style={{ color: initialState.color ?? "#94a3b8" }}>
                {initialState.name}
              </strong>{" "}
              and progress through the pipeline.
            </p>
          )}
        </section>

        {/* ─── 3. All States ─── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
              <Icon name="layers" size={14} className="text-purple-600" />
            </span>
            States ({sortedStates.length})
          </h3>
          <div className="space-y-2">
            {sortedStates.map((s, idx) => {
              const outgoing = transitionsByState.get(s.id) ?? [];
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">
                      #{idx + 1}
                    </span>
                    <span
                      className="inline-block h-4 w-4 rounded"
                      style={{ backgroundColor: s.color ?? "#94a3b8" }}
                    />
                    <span className="font-semibold text-gray-900">{s.name}</span>
                    <Badge variant={STATE_TYPE_VARIANT[s.stateType] ?? "default"}>
                      {STATE_TYPE_LABEL[s.stateType] ?? s.stateType}
                    </Badge>
                    {s.category && (
                      <Badge
                        variant={
                          s.category === "SUCCESS" ? "success"
                            : s.category === "FAILURE" ? "danger"
                            : "warning"
                        }
                      >
                        {CATEGORY_LABEL[s.category]}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono">{s.code}</span>
                    <span>&middot;</span>
                    <span>Sort: {s.sortOrder}</span>
                  </div>
                  {outgoing.length > 0 && (
                    <div className="mt-2 ml-6 border-l-2 border-gray-100 pl-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Can move to:
                      </p>
                      {outgoing.map((t) => {
                        const toState = stateMap.get(t.toStateId);
                        return (
                          <div key={t.id} className="flex items-center gap-1.5 py-0.5">
                            <Icon name="arrow-right" size={10} className="text-gray-300" />
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: toState?.color ?? "#94a3b8" }}
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {toState?.name ?? "Unknown"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              via &ldquo;{t.name}&rdquo;
                            </span>
                            <Badge variant={TRIGGER_VARIANT[t.triggerType] ?? "default"}>
                              {t.triggerType}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {outgoing.length === 0 && s.stateType === "TERMINAL" && (
                    <p className="mt-1 ml-6 text-[10px] text-gray-400 italic">
                      Terminal state &mdash; no outgoing transitions
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. Transition Matrix ─── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Icon name="arrow-right" size={14} className="text-amber-600" />
            </span>
            All Transitions ({workflow.transitions.length})
          </h3>
          {workflow.transitions.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No transitions configured yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">From</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500" />
                    <th className="px-3 py-2 text-left font-medium text-gray-500">To</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workflow.transitions.map((t) => {
                    const from = stateMap.get(t.fromStateId);
                    const to = stateMap.get(t.toStateId);
                    return (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-medium text-gray-800">{t.name}</td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: from?.color ?? "#94a3b8" }}
                            />
                            {from?.name ?? "?"}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center text-gray-300">
                          <Icon name="arrow-right" size={10} />
                        </td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: to?.color ?? "#94a3b8" }}
                            />
                            {to?.name ?? "?"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={TRIGGER_VARIANT[t.triggerType] ?? "default"}>
                            {t.triggerType}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ─── 5. Approval Gates (only if any) ─── */}
        {approvalTransitions.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                <Icon name="shield" size={14} className="text-red-600" />
              </span>
              Approval Gates ({approvalTransitions.length})
            </h3>
            <p className="mb-2 text-xs text-gray-500">
              These transitions require approval before they can execute:
            </p>
            <div className="space-y-1.5">
              {approvalTransitions.map((t) => {
                const from = stateMap.get(t.fromStateId);
                const to = stateMap.get(t.toStateId);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2"
                  >
                    <Badge variant="danger">APPROVAL</Badge>
                    <span className="text-xs font-medium text-gray-800">{t.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ({from?.name} &rarr; {to?.name})
                    </span>
                    {t.requiredRole && (
                      <span className="ml-auto text-[10px] text-red-600">
                        Role: {t.requiredRole}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 6. Auto Transitions (only if any) ─── */}
        {autoTransitions.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <Icon name="zap" size={14} className="text-blue-600" />
              </span>
              Automatic Transitions ({autoTransitions.length})
            </h3>
            <p className="mb-2 text-xs text-gray-500">
              These transitions trigger automatically when conditions are met:
            </p>
            <div className="space-y-1.5">
              {autoTransitions.map((t) => {
                const from = stateMap.get(t.fromStateId);
                const to = stateMap.get(t.toStateId);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2"
                  >
                    <Badge variant="primary">AUTO</Badge>
                    <span className="text-xs font-medium text-gray-800">{t.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ({from?.name} &rarr; {to?.name})
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 7. Access Control (if any transitions have role/permission) ─── */}
        {workflow.transitions.some((t) => t.requiredPermission || t.requiredRole) && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200">
                <Icon name="lock" size={14} className="text-gray-600" />
              </span>
              Access Control
            </h3>
            <p className="mb-2 text-xs text-gray-500">
              These transitions have role or permission requirements:
            </p>
            <div className="space-y-1.5">
              {workflow.transitions
                .filter((t) => t.requiredPermission || t.requiredRole)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-gray-800">{t.name}</span>
                    {t.requiredRole && (
                      <Badge variant="secondary">Role: {t.requiredRole}</Badge>
                    )}
                    {t.requiredPermission && (
                      <Badge variant="outline">Permission: {t.requiredPermission}</Badge>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ─── 8. How to Use ─── */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
              <Icon name="help-circle" size={14} className="text-emerald-600" />
            </span>
            How to Use This Workflow
          </h3>
          <div className="space-y-3">
            <div className="rounded-md border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-800">For Users:</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-gray-600">
                <li>
                  Open a {workflow.entityType.toLowerCase()}&apos;s detail page
                </li>
                <li>
                  The pipeline stepper shows the current stage
                </li>
                <li>
                  Click an available transition button to move forward
                </li>
                <li>
                  Add an optional comment explaining the change
                </li>
                <li>
                  The history is recorded automatically
                </li>
              </ol>
            </div>

            <div className="rounded-md border border-gray-100 p-3">
              <p className="text-xs font-semibold text-gray-800">For Admins:</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-gray-600">
                <li>
                  Edit this workflow to add/remove states or transitions
                </li>
                <li>
                  Drag state cards to reorder the pipeline
                </li>
                <li>
                  Set trigger types (Manual, Auto, Scheduled, Approval) per transition
                </li>
                <li>
                  Click <strong>Validate</strong> to check for errors
                </li>
                <li>
                  Click <strong>Publish</strong> to activate changes
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ─── Summary Card ─── */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Quick Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-600">
                {initialState ? `Starts at: ${initialState.name}` : "No initial state"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-600">
                {intermediateStates.length} intermediate stage{intermediateStates.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              <span className="text-gray-600">
                {terminalStates.length} end state{terminalStates.length !== 1 ? "s" : ""}
                {terminalStates.length > 0 && (
                  <> ({terminalStates.map((s) => s.name).join(", ")})</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-gray-600">
                {approvalTransitions.length} approval gate{approvalTransitions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
