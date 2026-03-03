"use client";

import { useState, useMemo, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

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
  useWorkflowVisual,
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

import type {
  WorkflowState,
  WorkflowTransition,
  WorkflowStateCreateData,
  WorkflowTransitionCreateData,
  VisualNode,
  VisualEdge,
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

// ── Component ────────────────────────────────────────────

export function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  // ── Queries ──
  const { data, isLoading } = useWorkflowDetail(workflowId);
  const { data: visualData } = useWorkflowVisual(workflowId);

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

  // ── Visual data ──
  const nodes: VisualNode[] = useMemo(() => visualData?.data?.nodes ?? [], [visualData]);
  const edges: VisualEdge[] = useMemo(() => visualData?.data?.edges ?? [], [visualData]);

  // ── Node map for edge rendering ──
  const nodeMap = useMemo(() => {
    const map = new Map<string, VisualNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // ── State name lookup for transitions table ──
  const stateNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (workflow?.states ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [workflow?.states]);

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
          icon="git-branch"
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

  return (
    <div className="p-6">
      {/* ── Page Header ── */}
      <PageHeader
        title={workflow.name}
        actions={
          <div className="flex gap-2">
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

      {/* ── Info Card ── */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Workflow Details
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-400">Name</dt>
            <dd className="text-sm font-medium">{workflow.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Code</dt>
            <dd className="text-sm">{workflow.code}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Entity Type</dt>
            <dd>
              <Badge variant="secondary">{workflow.entityType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Version</dt>
            <dd className="text-sm">{workflow.version}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Active</dt>
            <dd>
              <Badge variant={workflow.isActive ? "success" : "default"}>
                {workflow.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Published</dt>
            <dd>
              <Badge variant={workflow.isPublished ? "success" : "warning"}>
                {workflow.isPublished ? "Published" : "Draft"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Default</dt>
            <dd>
              <Badge variant={workflow.isDefault ? "primary" : "outline"}>
                {workflow.isDefault ? "Yes" : "No"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Created</dt>
            <dd className="text-sm">{formatDate(workflow.createdAt)}</dd>
          </div>
        </dl>
      </div>

      {/* ── States Panel ── */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-gray-500">
            States
          </h3>
          <Button variant="primary" size="sm" onClick={openAddState}>
            <Icon name="plus" size={14} /> Add State
          </Button>
        </div>

        {workflow.states.length === 0 ? (
          <EmptyState
            icon="layers"
            title="No states"
            description="Add states to define the workflow stages."
          />
        ) : (
          <div className="space-y-3">
            {workflow.states.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: s.color ?? "#e2e8f0" }}
                  />
                  <div>
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{s.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATE_TYPE_BADGE_VARIANT[s.stateType] ?? "default"}>
                    {s.stateType}
                  </Badge>
                  {s.category && (
                    <Badge variant={CATEGORY_BADGE_VARIANT[s.category] ?? "default"}>
                      {s.category}
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditState(s)}
                    >
                      <Icon name="edit" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteState(s)}
                    >
                      <Icon name="trash-2" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Transitions Panel ── */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-gray-500">
            Transitions
          </h3>
          <Button variant="primary" size="sm" onClick={openAddTransition}>
            <Icon name="plus" size={14} /> Add Transition
          </Button>
        </div>

        {workflow.transitions.length === 0 ? (
          <EmptyState
            icon="arrow-right"
            title="No transitions"
            description="Add transitions to connect workflow states."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">From State</th>
                  <th className="px-4 py-3">To State</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Trigger Type</th>
                  <th className="px-4 py-3">Required Permission</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workflow.transitions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {stateNameMap.get(t.fromStateId) ?? t.fromStateId}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {stateNameMap.get(t.toStateId) ?? t.toStateId}
                    </td>
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={TRIGGER_BADGE_VARIANT[t.triggerType] ?? "default"}>
                        {t.triggerType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.requiredPermission || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditTransition(t)}
                        >
                          <Icon name="edit" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTransition(t)}
                        >
                          <Icon name="trash-2" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Visual Diagram Section ── */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Workflow Diagram
        </h3>
        <div
          className="relative overflow-auto rounded-lg border border-gray-200 bg-slate-50"
          style={{ minHeight: 400 }}
        >
          {nodes.length === 0 ? (
            <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-gray-400">
              Publish workflow to generate diagram
            </div>
          ) : (
            <>
              {/* SVG edges overlay */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                  </marker>
                </defs>
                {edges.map((edge) => {
                  const sourceNode = nodeMap.get(edge.source);
                  const targetNode = nodeMap.get(edge.target);
                  if (!sourceNode || !targetNode) return null;
                  const x1 = sourceNode.x + 60;
                  const y1 = sourceNode.y + 25;
                  const x2 = targetNode.x + 60;
                  const y2 = targetNode.y + 25;
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  return (
                    <g key={edge.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#64748b"
                        strokeWidth={1.5}
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={midX}
                        y={midY - 6}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#475569"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: node.x,
                    top: node.y,
                    backgroundColor: node.color ?? "#e2e8f0",
                    borderRadius: 8,
                    padding: "8px 16px",
                    border: `2px solid ${darkenColor(node.color ?? "#e2e8f0")}`,
                    minWidth: 120,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{node.label}</div>
                  <div className="mt-1">
                    <Badge
                      variant={STATE_TYPE_BADGE_VARIANT[node.stateType] ?? "default"}
                    >
                      {node.stateType}
                    </Badge>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

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
