"use client";

import { useState, useMemo, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import {
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { Button, Icon, Badge } from "@/components/ui";

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
import { WorkflowStateModal } from "./WorkflowStateModal";
import type { WorkflowStateSavePayload } from "./WorkflowStateModal";
import { WorkflowTransitionModal } from "./WorkflowTransitionModal";
import type { WorkflowTransitionSavePayload } from "./WorkflowTransitionModal";
import { WorkflowGettingStarted } from "./WorkflowGettingStarted";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { WorkflowStatesPanel } from "./WorkflowStatesPanel";
import { WorkflowTransitionsPanel } from "./WorkflowTransitionsPanel";

import type {
  WorkflowState,
  WorkflowTransition,
  WorkflowStateCreateData,
  WorkflowTransitionCreateData,
} from "../types/workflows.types";

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

  // ── State Modal control ──
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<WorkflowState | null>(null);

  // ── Transition Modal control ──
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null);
  // Pre-fill values for "add transition from state card"
  const [transInitialFromStateId, setTransInitialFromStateId] = useState("");
  const [transInitialName, setTransInitialName] = useState("");
  const [transInitialCode, setTransInitialCode] = useState("");

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

  // ── State Modal openers ──
  const openAddState = useCallback(() => {
    setEditingState(null);
    setStateModalOpen(true);
  }, []);

  const openEditState = useCallback((s: WorkflowState) => {
    setEditingState(s);
    setStateModalOpen(true);
  }, []);

  const closeStateModal = useCallback(() => {
    setStateModalOpen(false);
    setEditingState(null);
  }, []);

  const handleSaveState = useCallback(
    async (payload: WorkflowStateSavePayload) => {
      try {
        if (payload.editingState) {
          await updateStateMutation.mutateAsync({
            stateId: payload.editingState.id,
            data: {
              name: payload.name,
              category: payload.stateCategory
                ? (payload.stateCategory as "SUCCESS" | "FAILURE" | "PAUSED")
                : undefined,
              color: payload.stateColor || undefined,
              sortOrder: parseInt(payload.stateSortOrder, 10) || 0,
            },
          });
          toast.success("State updated");
        } else {
          const createData: WorkflowStateCreateData = {
            name: payload.name,
            code: payload.code,
            stateType: payload.stateType as "INITIAL" | "INTERMEDIATE" | "TERMINAL",
            category: payload.stateCategory
              ? (payload.stateCategory as "SUCCESS" | "FAILURE" | "PAUSED")
              : undefined,
            color: payload.stateColor || undefined,
            sortOrder: parseInt(payload.stateSortOrder, 10) || 0,
          };
          await addStateMutation.mutateAsync({ workflowId, data: createData });
          toast.success("State added");
        }
        closeStateModal();
      } catch {
        toast.error(payload.editingState ? "Failed to update state" : "Failed to add state");
      }
    },
    [workflowId, addStateMutation, updateStateMutation, closeStateModal],
  );

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

  // ── Transition Modal openers ──
  const openAddTransition = useCallback(() => {
    setEditingTransition(null);
    setTransInitialFromStateId("");
    setTransInitialName("");
    setTransInitialCode("");
    setTransitionModalOpen(true);
  }, []);

  const openAddTransitionFrom = useCallback((s: WorkflowState) => {
    setEditingTransition(null);
    setTransInitialFromStateId(s.id);
    setTransInitialName(`${s.name} to `);
    setTransInitialCode(`${s.code}_TO_`);
    setTransitionModalOpen(true);
  }, []);

  const openEditTransition = useCallback((t: WorkflowTransition) => {
    setEditingTransition(t);
    setTransInitialFromStateId("");
    setTransInitialName("");
    setTransInitialCode("");
    setTransitionModalOpen(true);
  }, []);

  const closeTransitionModal = useCallback(() => {
    setTransitionModalOpen(false);
    setEditingTransition(null);
    setTransInitialFromStateId("");
    setTransInitialName("");
    setTransInitialCode("");
  }, []);

  const handleSaveTransition = useCallback(
    async (payload: WorkflowTransitionSavePayload) => {
      try {
        if (payload.editingTransition) {
          await updateTransitionMutation.mutateAsync({
            transitionId: payload.editingTransition.id,
            data: {
              name: payload.name,
              triggerType: payload.triggerType as "MANUAL" | "AUTO" | "SCHEDULED" | "APPROVAL",
              requiredPermission: payload.permission || undefined,
              requiredRole: payload.role || undefined,
            },
          });
          toast.success("Transition updated");
        } else {
          const createData: WorkflowTransitionCreateData = {
            fromStateId: payload.fromStateId,
            toStateId: payload.toStateId,
            name: payload.name,
            code: payload.code,
            triggerType: payload.triggerType as "MANUAL" | "AUTO" | "SCHEDULED" | "APPROVAL",
            requiredPermission: payload.permission || undefined,
            requiredRole: payload.role || undefined,
          };
          await addTransitionMutation.mutateAsync({ workflowId, data: createData });
          toast.success("Transition added");
        }
        closeTransitionModal();
      } catch {
        toast.error(
          payload.editingTransition ? "Failed to update transition" : "Failed to add transition",
        );
      }
    },
    [workflowId, addTransitionMutation, updateTransitionMutation, closeTransitionModal],
  );

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
        <WorkflowGettingStarted
          onAddState={openAddState}
          onShowHelp={() => openContent({ id: "workflow-help", title: "Workflow Builder Guide", content: <WorkflowHelpContent /> })}
        />
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
            <WorkflowStatesPanel
              sortedStates={sortedStates}
              statesCount={statesCount}
              sensors={sensors}
              onDragEnd={handleDragEnd}
              onAddState={openAddState}
              onEditState={openEditState}
              onDeleteState={handleDeleteState}
              onAddTransitionFrom={openAddTransitionFrom}
            />
            <WorkflowTransitionsPanel
              transitions={workflow.transitions}
              states={workflow.states}
              statesCount={statesCount}
              transitionsCount={transitionsCount}
              stateNameMap={stateNameMap}
              onAddTransition={openAddTransition}
              onEditTransition={openEditTransition}
              onDeleteTransition={handleDeleteTransition}
            />
          </div>
        </>
      )}

      {/* ── Visual Diagram Section ── */}
      {statesCount > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
            <Icon name="monitor" size={14} /> Workflow Diagram
          </h3>
          <WorkflowDiagram states={sortedStates} transitions={workflow.transitions} />
        </div>
      )}

      {/* ── State Modal ── */}
      <WorkflowStateModal
        open={stateModalOpen}
        editingState={editingState}
        isSaving={addStateMutation.isPending || updateStateMutation.isPending}
        onClose={closeStateModal}
        onSave={handleSaveState}
      />

      {/* ── Transition Modal ── */}
      <WorkflowTransitionModal
        open={transitionModalOpen}
        editingTransition={editingTransition}
        stateOptions={stateOptions}
        initialFromStateId={transInitialFromStateId}
        initialName={transInitialName}
        initialCode={transInitialCode}
        isSaving={addTransitionMutation.isPending || updateTransitionMutation.isPending}
        onClose={closeTransitionModal}
        onSave={handleSaveTransition}
      />

      <ConfirmDialogPortal />
    </div>
  );
}
