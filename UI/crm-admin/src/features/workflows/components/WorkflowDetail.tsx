"use client";

import { useState, useMemo, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

import {
  Button,
  Icon,
  Badge,
  Modal,
  Input,
  SelectInput,
  ColorPicker,
} from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { formatDate } from "@/lib/format-date";

import {
  useWorkflowDetail,
  usePublishWorkflow,
  useValidateWorkflow,
  useCloneWorkflow,
  useAddState,
  useUpdateState,
  useDeleteState,
  useAddTransition,
  useUpdateTransition,
  useDeleteTransition,
} from "../hooks/useWorkflows";

import { useContentPanel } from "@/hooks/useEntityPanel";

import { WorkflowHelpContent } from "./WorkflowHelp";
import { WorkflowAutoHelpContent } from "./WorkflowAutoHelp";

import type {
  WorkflowState,
  WorkflowTransition,
  WorkflowStateCreateData,
  WorkflowTransitionCreateData,
} from "../types/workflows.types";

// ── Constants ────────────────────────────────────────────

const STATE_TYPE_OPTIONS = [
  { label: "Initial", value: "INITIAL" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Terminal", value: "TERMINAL" },
];

const CATEGORY_OPTIONS = [
  { label: "Success", value: "SUCCESS" },
  { label: "Failure", value: "FAILURE" },
  { label: "Paused", value: "PAUSED" },
];

const TRIGGER_TYPE_OPTIONS = [
  { label: "Manual", value: "MANUAL" },
  { label: "Auto", value: "AUTO" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Approval", value: "APPROVAL" },
];

const STATE_TYPE_BADGE_VARIANT: Record<string, "success" | "primary" | "default"> = {
  INITIAL: "success",
  INTERMEDIATE: "primary",
  TERMINAL: "default",
};

const CATEGORY_BADGE_VARIANT: Record<string, "success" | "danger" | "warning"> = {
  SUCCESS: "success",
  FAILURE: "danger",
  PAUSED: "warning",
};

const TRIGGER_BADGE_VARIANT: Record<string, "default" | "primary" | "warning" | "danger"> = {
  MANUAL: "default",
  AUTO: "primary",
  SCHEDULED: "warning",
  APPROVAL: "danger",
};

// ── SortableStateCard ────────────────────────────────────

function SortableStateCard({
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

// ── GettingStarted ───────────────────────────────────────

function GettingStarted({
  onAddState,
  onShowHelp,
}: {
  onAddState: () => void;
  onShowHelp: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Icon name="activity" size={32} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Build Your Workflow Pipeline
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Follow these steps to configure your workflow. Each step builds on the
          previous one.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md space-y-4">
        {/* Step 1 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            1
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Add States</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Define the stages your entity will pass through. Start with an Initial state,
              add Intermediate stages, and finish with Terminal states (Won/Lost).
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddState}
              className="mt-2"
            >
              <Icon name="plus" size={14} /> Add First State
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 opacity-60 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
            2
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Add Transitions</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Connect your states with transitions to define allowed movements.
              For example: New &rarr; Verified, Verified &rarr; Allocated.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4 rounded-lg bg-white p-4 opacity-60 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
            3
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Validate &amp; Publish</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Validate your workflow to check for errors, then publish to activate
              it for use.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onShowHelp}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          <Icon name="help-circle" size={14} className="mr-1 inline" />
          Read the full Workflow Builder Guide
        </button>
      </div>
    </div>
  );
}

// ── Workflow Diagram (client-side layout) ───────────────

const NODE_W = 140;
const NODE_H = 56;
const COL_GAP = 60;
const ROW_GAP = 40;
const PADDING = 30;
const COLS_PER_ROW = 5;

interface DiagramNode {
  id: string;
  label: string;
  stateType: string;
  color: string;
  x: number;
  y: number;
}

function WorkflowDiagram({
  states,
  transitions,
}: {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}) {
  const layout = useMemo(() => {
    const nodes: DiagramNode[] = states.map((s, idx) => {
      const col = idx % COLS_PER_ROW;
      const row = Math.floor(idx / COLS_PER_ROW);
      return {
        id: s.id,
        label: s.name,
        stateType: s.stateType,
        color: s.color ?? "#94a3b8",
        x: PADDING + col * (NODE_W + COL_GAP),
        y: PADDING + row * (NODE_H + ROW_GAP),
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const edgeLines = transitions
      .map((t) => {
        const src = nodeMap.get(t.fromStateId);
        const tgt = nodeMap.get(t.toStateId);
        if (!src || !tgt) return null;
        return { id: t.id, src, tgt, label: t.name, triggerType: t.triggerType };
      })
      .filter(Boolean) as Array<{
        id: string;
        src: DiagramNode;
        tgt: DiagramNode;
        label: string;
        triggerType: string;
      }>;

    const totalRows = Math.ceil(states.length / COLS_PER_ROW);
    const totalCols = Math.min(states.length, COLS_PER_ROW);
    const svgW = PADDING * 2 + totalCols * NODE_W + (totalCols - 1) * COL_GAP;
    const svgH = PADDING * 2 + totalRows * NODE_H + (totalRows - 1) * ROW_GAP;

    return { nodes, edgeLines, svgW, svgH };
  }, [states, transitions]);

  if (layout.nodes.length === 0) return null;

  return (
    <div className="overflow-auto rounded-lg border border-gray-100 bg-slate-50">
      <svg
        width={Math.max(layout.svgW, 600)}
        height={Math.max(layout.svgH, 200)}
        viewBox={`0 0 ${Math.max(layout.svgW, 600)} ${Math.max(layout.svgH, 200)}`}
        className="select-none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {layout.edgeLines.map((e) => {
          const srcCx = e.src.x + NODE_W / 2;
          const srcCy = e.src.y + NODE_H / 2;
          const tgtCx = e.tgt.x + NODE_W / 2;
          const tgtCy = e.tgt.y + NODE_H / 2;

          // Calculate start/end at node borders
          const dx = tgtCx - srcCx;
          const dy = tgtCy - srcCy;

          // Determine which side to connect
          let x1: number, y1: number, x2: number, y2: number;
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal connection
            if (dx > 0) {
              x1 = e.src.x + NODE_W;
              y1 = srcCy;
              x2 = e.tgt.x;
              y2 = tgtCy;
            } else {
              x1 = e.src.x;
              y1 = srcCy;
              x2 = e.tgt.x + NODE_W;
              y2 = tgtCy;
            }
          } else {
            // Vertical connection
            if (dy > 0) {
              x1 = srcCx;
              y1 = e.src.y + NODE_H;
              x2 = tgtCx;
              y2 = e.tgt.y;
            } else {
              x1 = srcCx;
              y1 = e.src.y;
              x2 = tgtCx;
              y2 = e.tgt.y + NODE_H;
            }
          }

          // Curved path
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const path =
            Math.abs(dy) < 10
              ? `M ${x1} ${y1} L ${x2} ${y2}`
              : `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${midY} Q ${midX} ${y2} ${x2} ${y2}`;

          return (
            <g key={e.id}>
              <path
                d={path}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {layout.nodes.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill={n.color}
              stroke={darkenColor(n.color)}
              strokeWidth={2}
            />
            <text
              x={n.x + NODE_W / 2}
              y={n.y + NODE_H / 2 - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={12}
              fontWeight={600}
            >
              {n.label}
            </text>
            <text
              x={n.x + NODE_W / 2}
              y={n.y + NODE_H / 2 + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize={9}
              fontWeight={500}
            >
              {n.stateType}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Component ────────────────────────────────────────────

export function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const { openContent } = useContentPanel();

  // ── Queries ──
  const { data, isLoading } = useWorkflowDetail(workflowId);

  // ── Mutations ──
  const publishMutation = usePublishWorkflow();
  const validateMutation = useValidateWorkflow();
  const cloneMutation = useCloneWorkflow();
  const addStateMutation = useAddState();
  const updateStateMutation = useUpdateState();
  const deleteStateMutation = useDeleteState();
  const addTransitionMutation = useAddTransition();
  const updateTransitionMutation = useUpdateTransition();
  const deleteTransitionMutation = useDeleteTransition();

  const workflow = data?.data;

  // ── State Modal ──
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<WorkflowState | null>(null);
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateType, setStateType] = useState("INITIAL");
  const [stateCategory, setStateCategory] = useState("");
  const [stateColor, setStateColor] = useState("#3b82f6");
  const [stateSortOrder, setStateSortOrder] = useState("0");

  // ── Transition Modal ──
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null);
  const [fromStateId, setFromStateId] = useState("");
  const [toStateId, setToStateId] = useState("");
  const [transName, setTransName] = useState("");
  const [transCode, setTransCode] = useState("");
  const [transTriggerType, setTransTriggerType] = useState("MANUAL");
  const [transPermission, setTransPermission] = useState("");
  const [transRole, setTransRole] = useState("");

  // ── State options for transition selects ──
  const stateOptions = useMemo(
    () =>
      (workflow?.states ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [workflow?.states],
  );

  // ── State name lookup for transitions table ──
  const stateNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (workflow?.states ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [workflow?.states]);

  // ── Sorted states ──
  const sortedStates = useMemo(
    () => [...(workflow?.states ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [workflow?.states],
  );

  // ── DnD for states ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !workflow) return;

      const oldIndex = sortedStates.findIndex((s) => s.id === active.id);
      const newIndex = sortedStates.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sortedStates, oldIndex, newIndex);

      // Update each moved state's sort order via API
      const promises = reordered.map((s, idx) => {
        if (s.sortOrder !== idx * 10) {
          return updateStateMutation.mutateAsync({
            stateId: s.id,
            data: { sortOrder: idx * 10 },
          });
        }
        return null;
      }).filter(Boolean);

      if (promises.length > 0) {
        try {
          await Promise.all(promises);
          toast.success("State order updated");
        } catch {
          toast.error("Failed to update state order");
        }
      }
    },
    [workflow, sortedStates, updateStateMutation],
  );

  // ── State Modal helpers ──
  const resetStateForm = useCallback(() => {
    setStateName("");
    setStateCode("");
    setStateType("INITIAL");
    setStateCategory("");
    setStateColor("#3b82f6");
    setStateSortOrder("0");
    setEditingState(null);
  }, []);

  const openAddState = useCallback(() => {
    resetStateForm();
    setStateModalOpen(true);
  }, [resetStateForm]);

  const openEditState = useCallback((s: WorkflowState) => {
    setEditingState(s);
    setStateName(s.name);
    setStateCode(s.code);
    setStateType(s.stateType);
    setStateCategory(s.category ?? "");
    setStateColor(s.color ?? "#3b82f6");
    setStateSortOrder(String(s.sortOrder));
    setStateModalOpen(true);
  }, []);

  const closeStateModal = useCallback(() => {
    setStateModalOpen(false);
    resetStateForm();
  }, [resetStateForm]);

  const handleSaveState = useCallback(async () => {
    if (!stateName.trim() || !stateCode.trim()) {
      toast.error("Name and code are required");
      return;
    }
    try {
      if (editingState) {
        await updateStateMutation.mutateAsync({
          stateId: editingState.id,
          data: {
            name: stateName,
            category: stateCategory ? (stateCategory as "SUCCESS" | "FAILURE" | "PAUSED") : undefined,
            color: stateColor || undefined,
            sortOrder: parseInt(stateSortOrder, 10) || 0,
          },
        });
        toast.success("State updated");
      } else {
        const createData: WorkflowStateCreateData = {
          name: stateName,
          code: stateCode,
          stateType: stateType as "INITIAL" | "INTERMEDIATE" | "TERMINAL",
          category: stateCategory ? (stateCategory as "SUCCESS" | "FAILURE" | "PAUSED") : undefined,
          color: stateColor || undefined,
          sortOrder: parseInt(stateSortOrder, 10) || 0,
        };
        await addStateMutation.mutateAsync({
          workflowId,
          data: createData,
        });
        toast.success("State added");
      }
      closeStateModal();
    } catch {
      toast.error(editingState ? "Failed to update state" : "Failed to add state");
    }
  }, [
    editingState,
    stateName,
    stateCode,
    stateType,
    stateCategory,
    stateColor,
    stateSortOrder,
    workflowId,
    addStateMutation,
    updateStateMutation,
    closeStateModal,
  ]);

  const handleDeleteState = useCallback(
    async (s: WorkflowState) => {
      const ok = await confirm({
        title: "Delete State",
        message: `Are you sure you want to delete "${s.name}"? This may break existing transitions.`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deleteStateMutation.mutateAsync(s.id);
        toast.success("State deleted");
      } catch {
        toast.error("Failed to delete state");
      }
    },
    [confirm, deleteStateMutation],
  );

  // ── Transition Modal helpers ──
  const resetTransitionForm = useCallback(() => {
    setFromStateId("");
    setToStateId("");
    setTransName("");
    setTransCode("");
    setTransTriggerType("MANUAL");
    setTransPermission("");
    setTransRole("");
    setEditingTransition(null);
  }, []);

  const openAddTransition = useCallback(() => {
    resetTransitionForm();
    setTransitionModalOpen(true);
  }, [resetTransitionForm]);

  const openAddTransitionFrom = useCallback(
    (s: WorkflowState) => {
      resetTransitionForm();
      setFromStateId(s.id);
      setTransName(`${s.name} to `);
      setTransCode(`${s.code}_TO_`);
      setTransitionModalOpen(true);
    },
    [resetTransitionForm],
  );

  const openEditTransition = useCallback((t: WorkflowTransition) => {
    setEditingTransition(t);
    setFromStateId(t.fromStateId);
    setToStateId(t.toStateId);
    setTransName(t.name);
    setTransCode(t.code);
    setTransTriggerType(t.triggerType);
    setTransPermission(t.requiredPermission ?? "");
    setTransRole(t.requiredRole ?? "");
    setTransitionModalOpen(true);
  }, []);

  const closeTransitionModal = useCallback(() => {
    setTransitionModalOpen(false);
    resetTransitionForm();
  }, [resetTransitionForm]);

  const handleSaveTransition = useCallback(async () => {
    if (!transName.trim() || !transCode.trim() || !fromStateId || !toStateId) {
      toast.error("Name, code, from state, and to state are required");
      return;
    }
    try {
      if (editingTransition) {
        await updateTransitionMutation.mutateAsync({
          transitionId: editingTransition.id,
          data: {
            name: transName,
            triggerType: transTriggerType as "MANUAL" | "AUTO" | "SCHEDULED" | "APPROVAL",
            requiredPermission: transPermission || undefined,
            requiredRole: transRole || undefined,
          },
        });
        toast.success("Transition updated");
      } else {
        const createData: WorkflowTransitionCreateData = {
          fromStateId,
          toStateId,
          name: transName,
          code: transCode,
          triggerType: transTriggerType as "MANUAL" | "AUTO" | "SCHEDULED" | "APPROVAL",
          requiredPermission: transPermission || undefined,
          requiredRole: transRole || undefined,
        };
        await addTransitionMutation.mutateAsync({
          workflowId,
          data: createData,
        });
        toast.success("Transition added");
      }
      closeTransitionModal();
    } catch {
      toast.error(editingTransition ? "Failed to update transition" : "Failed to add transition");
    }
  }, [
    editingTransition,
    fromStateId,
    toStateId,
    transName,
    transCode,
    transTriggerType,
    transPermission,
    transRole,
    workflowId,
    addTransitionMutation,
    updateTransitionMutation,
    closeTransitionModal,
  ]);

  const handleDeleteTransition = useCallback(
    async (t: WorkflowTransition) => {
      const ok = await confirm({
        title: "Delete Transition",
        message: `Are you sure you want to delete "${t.name}"?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deleteTransitionMutation.mutateAsync(t.id);
        toast.success("Transition deleted");
      } catch {
        toast.error("Failed to delete transition");
      }
    },
    [confirm, deleteTransitionMutation],
  );

  // ── Top-level actions ──
  const handlePublish = useCallback(async () => {
    try {
      await publishMutation.mutateAsync(workflowId);
      toast.success("Workflow published");
    } catch {
      toast.error("Failed to publish workflow");
    }
  }, [publishMutation, workflowId]);

  const handleValidate = useCallback(async () => {
    try {
      const result = await validateMutation.mutateAsync(workflowId);
      const validation = result.data;
      if (validation.valid) {
        toast.success("Workflow is valid");
      } else {
        const msgs = [...validation.errors, ...validation.warnings];
        toast.error(msgs.join("\n") || "Workflow has validation issues");
      }
    } catch {
      toast.error("Failed to validate workflow");
    }
  }, [validateMutation, workflowId]);

  const handleClone = useCallback(async () => {
    try {
      const result = await cloneMutation.mutateAsync(workflowId);
      toast.success("Workflow cloned");
      router.push(`/workflows/${result.data.id}`);
    } catch {
      toast.error("Failed to clone workflow");
    }
  }, [cloneMutation, workflowId, router]);

  // ── Loading / Empty ──
  if (isLoading) return <LoadingSpinner fullPage />;

  if (!workflow) {
    return (
      <div className="p-6">
        <EmptyState
          icon="activity"
          title="Workflow not found"
          description="The workflow you're looking for doesn't exist."
          action={{
            label: "Back to Workflows",
            onClick: () => router.push("/workflows"),
          }}
        />
      </div>
    );
  }

  const statesCount = workflow.states.length;
  const transitionsCount = workflow.transitions.length;

  return (
    <div className="p-6">
      {/* ── Page Header ── */}
      <PageHeader
        title={workflow.name}
        subtitle={workflow.description || `${workflow.entityType} workflow`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openContent({ id: "workflow-auto-help", title: workflow.name, content: <WorkflowAutoHelpContent workflow={workflow} /> })}>
              <Icon name="file-text" size={16} /> Docs
            </Button>
            <Button variant="outline" onClick={() => openContent({ id: "workflow-help", title: "Workflow Builder Guide", content: <WorkflowHelpContent /> })}>
              <Icon name="help-circle" size={16} /> Guide
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/workflows/${workflowId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={workflow.isPublished}
              loading={publishMutation.isPending}
            >
              <Icon name="upload" size={16} /> Publish
            </Button>
            <Button
              variant="outline"
              onClick={handleValidate}
              loading={validateMutation.isPending}
            >
              <Icon name="check-circle" size={16} /> Validate
            </Button>
            <Button
              variant="outline"
              onClick={handleClone}
              loading={cloneMutation.isPending}
            >
              <Icon name="copy" size={16} /> Clone
            </Button>
          </div>
        }
      />

      {/* ── Compact Info Bar ── */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white px-5 py-3">
        <div className="flex flex-wrap items-center gap-y-2 divide-x divide-gray-200">
          <div className="flex items-center gap-1.5 pr-5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Code</span>
            <span className="font-mono text-sm font-semibold text-gray-800">{workflow.code}</span>
          </div>
          <div className="flex items-center gap-1.5 px-5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Entity</span>
            <Badge variant="secondary">{workflow.entityType}</Badge>
          </div>
          <div className="flex items-center gap-1.5 px-5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Status</span>
            <Badge variant={workflow.isPublished ? "success" : "warning"}>
              {workflow.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 px-5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Active</span>
            <Badge variant={workflow.isActive ? "success" : "default"}>
              {workflow.isActive ? "Yes" : "No"}
            </Badge>
          </div>
          {workflow.isDefault && (
            <div className="px-5">
              <Badge variant="primary">Default</Badge>
            </div>
          )}
          <div className="px-5">
            <span className="text-xs font-medium text-gray-500">v{workflow.version}</span>
          </div>
          <div className="ml-auto flex items-center gap-3 pl-5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Icon name="layers" size={12} className="text-gray-400" />
              {statesCount} states
            </span>
            <span className="flex items-center gap-1">
              <Icon name="arrow-right" size={12} className="text-gray-400" />
              {transitionsCount} transitions
            </span>
            <span>{formatDate(workflow.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* ── Getting Started (empty workflow) ── */}
      {statesCount === 0 && transitionsCount === 0 ? (
        <GettingStarted onAddState={openAddState} onShowHelp={() => openContent({ id: "workflow-help", title: "Workflow Builder Guide", content: <WorkflowHelpContent /> })} />
      ) : (
        <>
          {/* ── Visual Pipeline Preview ── */}
          {sortedStates.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {sortedStates.map((s, idx) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className="flex h-8 items-center rounded-full px-3 text-xs font-medium text-white shadow-sm whitespace-nowrap"
                      style={{ backgroundColor: s.color ?? "#94a3b8" }}
                    >
                      {s.name}
                    </div>
                    {idx < sortedStates.length - 1 && (
                      <Icon name="chevron-right" size={14} className="mx-0.5 flex-shrink-0 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── States & Transitions Side-by-Side ── */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* States Panel */}
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                  <Icon name="layers" size={14} /> States
                  <Badge variant="outline">{statesCount}</Badge>
                </h3>
                <Button variant="primary" size="sm" onClick={openAddState}>
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
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortedStates.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1.5">
                        {sortedStates.map((s) => (
                          <SortableStateCard
                            key={s.id}
                            state={s}
                            onEdit={openEditState}
                            onDelete={handleDeleteState}
                            onAddTransitionFrom={openAddTransitionFrom}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </div>

            {/* Transitions Panel */}
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                  <Icon name="arrow-right" size={14} /> Transitions
                  <Badge variant="outline">{transitionsCount}</Badge>
                </h3>
                <Button variant="primary" size="sm" onClick={openAddTransition}>
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
                  {workflow.transitions.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: workflow.states.find((s) => s.id === t.fromStateId)?.color ?? "#94a3b8" }}
                        />
                        <span className="truncate text-xs font-medium">{stateNameMap.get(t.fromStateId) ?? "?"}</span>
                        <Icon name="arrow-right" size={12} className="flex-shrink-0 text-gray-300" />
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: workflow.states.find((s) => s.id === t.toStateId)?.color ?? "#94a3b8" }}
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
                          onClick={() => openEditTransition(t)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteTransition(t)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Visual Diagram Section (client-side layout) ── */}
      {statesCount > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
            <Icon name="monitor" size={14} /> Workflow Diagram
          </h3>
          <WorkflowDiagram states={sortedStates} transitions={workflow.transitions} />
        </div>
      )}

      {/* ── State Modal ── */}
      <Modal
        open={stateModalOpen}
        onClose={closeStateModal}
        title={editingState ? "Edit State" : "Add State"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeStateModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveState}
              loading={addStateMutation.isPending || updateStateMutation.isPending}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={stateName}
              onChange={(v: string) => setStateName(v)}
              placeholder="State name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Code
            </label>
            <Input
              value={stateCode}
              onChange={(v: string) => setStateCode(v)}
              placeholder="STATE_CODE"
              disabled={!!editingState}
            />
          </div>
          <SelectInput
            label="State Type"
            options={STATE_TYPE_OPTIONS}
            value={stateType}
            onChange={(v) => setStateType(String(v ?? "INITIAL"))}
            disabled={!!editingState}
          />
          {stateType === "TERMINAL" && (
            <SelectInput
              label="Category"
              options={CATEGORY_OPTIONS}
              value={stateCategory}
              onChange={(v) => setStateCategory(String(v ?? ""))}
            />
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Color
            </label>
            <ColorPicker
              value={stateColor}
              onChange={(v: string) => setStateColor(v)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <Input
              value={stateSortOrder}
              onChange={(v: string) => setStateSortOrder(v)}
              placeholder="0"
            />
          </div>
        </div>
      </Modal>

      {/* ── Transition Modal ── */}
      <Modal
        open={transitionModalOpen}
        onClose={closeTransitionModal}
        title={editingTransition ? "Edit Transition" : "Add Transition"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeTransitionModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTransition}
              loading={addTransitionMutation.isPending || updateTransitionMutation.isPending}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectInput
            label="From State"
            options={stateOptions}
            value={fromStateId}
            onChange={(v) => setFromStateId(String(v ?? ""))}
            disabled={!!editingTransition}
          />
          <SelectInput
            label="To State"
            options={stateOptions}
            value={toStateId}
            onChange={(v) => setToStateId(String(v ?? ""))}
            disabled={!!editingTransition}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={transName}
              onChange={(v: string) => setTransName(v)}
              placeholder="Transition name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Code
            </label>
            <Input
              value={transCode}
              onChange={(v: string) => setTransCode(v)}
              placeholder="TRANSITION_CODE"
              disabled={!!editingTransition}
            />
          </div>
          <SelectInput
            label="Trigger Type"
            options={TRIGGER_TYPE_OPTIONS}
            value={transTriggerType}
            onChange={(v) => setTransTriggerType(String(v ?? "MANUAL"))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Required Permission
            </label>
            <Input
              value={transPermission}
              onChange={(v: string) => setTransPermission(v)}
              placeholder="Optional permission code"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Required Role
            </label>
            <Input
              value={transRole}
              onChange={(v: string) => setTransRole(v)}
              placeholder="Optional role code"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialogPortal />
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────

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
