"use client";

import { useState, useCallback, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Icon, Modal, Input } from "@/components/ui";

import {
  useLeadWorkflowStatus,
  useLeadWorkflowTransitions,
  useExecuteLeadTransition,
} from "@/features/workflows/hooks/useWorkflowExecution";

import { workflowsService } from "@/features/workflows/services/workflows.service";

import { useQuery } from "@tanstack/react-query";

import type { WorkflowState } from "@/features/workflows/types/workflows.types";

import { useLeadDetail, useChangeLeadStatus } from "../hooks/useLeads";
import type { LeadStatus } from "../types/leads.types";

// ── Props ────────────────────────────────────────────────

interface LeadPipelineProps {
  leadId: string;
}

// ── Side-track codes (shown as badges, not in main line) ─

const SIDE_TRACK_CODES = new Set(["ON_HOLD", "LOST"]);

// ── Multi-color palette for pipeline steps ───────────────

const STEP_PALETTE = [
  { bg: "#0d9488", light: "#ccfbf1", text: "#0d9488" },  // teal
  { bg: "#2563eb", light: "#dbeafe", text: "#1d4ed8" },  // blue
  { bg: "#7c3aed", light: "#ede9fe", text: "#6d28d9" },  // violet
  { bg: "#ea580c", light: "#ffedd5", text: "#c2410c" },  // orange
  { bg: "#0891b2", light: "#cffafe", text: "#0e7490" },  // cyan
  { bg: "#d97706", light: "#fef3c7", text: "#b45309" },  // amber
  { bg: "#be185d", light: "#fce7f3", text: "#9d174d" },  // pink
  { bg: "#059669", light: "#d1fae5", text: "#047857" },  // emerald
];

// ── Legacy pipeline statuses (main-line order) ───────────

const LEGACY_PIPELINE: LeadStatus[] = [
  "NEW",
  "VERIFIED",
  "ALLOCATED",
  "IN_PROGRESS",
  "DEMO_SCHEDULED",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "WON",
];

const LEGACY_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  VERIFIED: "Verified",
  ALLOCATED: "Allocated",
  IN_PROGRESS: "In Progress",
  DEMO_SCHEDULED: "Demo Scheduled",
  QUOTATION_SENT: "Quotation Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
  ON_HOLD: "On Hold",
};

function statusLabel(s: string) {
  return LEGACY_STATUS_LABELS[s] ?? s.replace(/_/g, " ");
}

// ── Component ────────────────────────────────────────────

export function LeadPipeline({ leadId }: LeadPipelineProps) {
  const [transitionComment, setTransitionComment] = useState("");
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);

  // Confirmation dialog state (shared by both workflow & legacy)
  const [confirmTransition, setConfirmTransition] = useState<{
    code: string;
    name: string;
    toStateCode: string;
    mode: "workflow" | "legacy";
  } | null>(null);
  const [confirmReason, setConfirmReason] = useState("");

  // ── Workflow hooks ──
  const { data: statusData, isLoading: statusLoading } = useLeadWorkflowStatus(leadId);
  const { data: transitionsData } = useLeadWorkflowTransitions(leadId);
  const executeMutation = useExecuteLeadTransition();

  // ── Legacy hooks ──
  const { data: leadData } = useLeadDetail(leadId);
  const changeStatusMutation = useChangeLeadStatus();

  const workflowStatus = statusData?.data;
  const transitions = transitionsData?.data ?? [];
  const lead = leadData?.data;
  const hasWorkflow = !!workflowStatus;

  // Fetch workflow detail to get all states
  const { data: workflowDetail } = useQuery({
    queryKey: ["workflows", workflowStatus?.workflowId],
    queryFn: () => workflowsService.getById(workflowStatus!.workflowId),
    enabled: !!workflowStatus?.workflowId,
  });

  const allStates = workflowDetail?.data?.states ?? [];

  // Main-line states (sorted by sortOrder, excluding side-track)
  const mainStates = useMemo(
    () =>
      allStates
        .filter((s: WorkflowState) => s.isActive && !SIDE_TRACK_CODES.has(s.code))
        .sort((a: WorkflowState, b: WorkflowState) => a.sortOrder - b.sortOrder),
    [allStates],
  );

  // Determine which states are completed, current, and future
  const currentSortOrder = useMemo(() => {
    if (!workflowStatus) return -1;
    const current = allStates.find(
      (s: WorkflowState) => s.code === workflowStatus.currentState.code,
    );
    return current?.sortOrder ?? -1;
  }, [workflowStatus, allStates]);

  // Ask for confirmation before executing transition
  const requestTransition = useCallback(
    (transitionCode: string, transitionName: string, toStateCode: string, mode: "workflow" | "legacy" = "workflow") => {
      setConfirmTransition({ code: transitionCode, name: transitionName, toStateCode, mode });
      setConfirmReason("");
    },
    [],
  );

  // Execute workflow transition after confirmation
  const handleWorkflowTransition = useCallback(
    async (transitionCode: string) => {
      try {
        const comment = confirmReason || transitionComment || undefined;
        await executeMutation.mutateAsync({
          leadId,
          transitionCode,
          comment,
        });
        toast.success("Lead status updated");
        setTransitionComment("");
        setShowCommentFor(null);
        setConfirmTransition(null);
        setConfirmReason("");
      } catch {
        toast.error("Failed to execute transition");
      }
    },
    [leadId, executeMutation, transitionComment, confirmReason],
  );

  // Execute legacy status change after confirmation
  const handleLegacyTransition = useCallback(
    async (newStatus: string) => {
      try {
        await changeStatusMutation.mutateAsync({
          id: leadId,
          status: newStatus,
          reason: confirmReason || undefined,
        });
        toast.success(`Lead moved to ${statusLabel(newStatus)}`);
        setConfirmTransition(null);
        setConfirmReason("");
      } catch {
        toast.error("Failed to change status");
      }
    },
    [leadId, changeStatusMutation, confirmReason],
  );

  // Unified confirm handler
  const handleConfirm = useCallback(() => {
    if (!confirmTransition) return;
    if (confirmTransition.mode === "workflow") {
      handleWorkflowTransition(confirmTransition.code);
    } else {
      handleLegacyTransition(confirmTransition.toStateCode);
    }
  }, [confirmTransition, handleWorkflowTransition, handleLegacyTransition]);

  const isPending = executeMutation.isPending || changeStatusMutation.isPending;

  if (statusLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading pipeline...</span>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // LEGACY PIPELINE (no workflow configured)
  // ────────────────────────────────────────────────────────────
  if (!hasWorkflow && lead) {
    const currentStatus = lead.status;
    const currentIdx = LEGACY_PIPELINE.indexOf(currentStatus);
    const isSideTrackLegacy = SIDE_TRACK_CODES.has(currentStatus);
    const validNext = lead.validNextStatuses ?? [];
    const isTerminal = lead.isTerminal;

    return (
      <div>
        {/* ── Arrow Pipeline Stepper (Legacy) ─── */}
        <div className="flex items-stretch overflow-x-auto pb-2">
          {LEGACY_PIPELINE.map((status, idx) => {
            const isCompleted = !isSideTrackLegacy && idx < currentIdx;
            const isCurrent = status === currentStatus;
            const isFuture = !isCompleted && !isCurrent;
            const isFirst = idx === 0;
            const isLast = idx === LEGACY_PIPELINE.length - 1;
            const palette = STEP_PALETTE[idx % STEP_PALETTE.length];
            const notch = 14;

            return (
              <div
                key={status}
                className="relative flex items-center"
                style={{ marginLeft: isFirst ? 0 : -1 }}
              >
                <div
                  className="relative flex items-center justify-center px-4 py-2 transition-all"
                  style={{
                    minWidth: 110,
                    background: isFuture ? palette.light : palette.bg,
                    color: isFuture ? palette.text : "#fff",
                    clipPath: isFirst
                      ? `polygon(0 0, calc(100% - ${notch}px) 0, 100% 50%, calc(100% - ${notch}px) 100%, 0 100%)`
                      : isLast
                        ? `polygon(${notch}px 0, 100% 0, 100% 100%, 0 100%, ${notch}px 50%)`
                        : `polygon(${notch}px 0, calc(100% - ${notch}px) 0, 100% 50%, calc(100% - ${notch}px) 100%, 0 100%, ${notch}px 50%)`,
                    paddingLeft: isFirst ? 16 : notch + 12,
                    paddingRight: isLast ? 16 : notch + 8,
                  }}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold">
                    {isCompleted && <Icon name="check" size={13} />}
                    {isCurrent && <Icon name="circle" size={8} />}
                    {statusLabel(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Side-track badge for LOST/ON_HOLD ── */}
        {isSideTrackLegacy && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: currentStatus === "LOST" ? "#ef4444" : "#f59e0b" }}
            >
              <Icon name={currentStatus === "LOST" ? "x-circle" : "pause-circle"} size={13} />
              {statusLabel(currentStatus)}
            </span>
          </div>
        )}

        {/* ── Transition Buttons (Legacy) ─────── */}
        {validNext.length > 0 && !isTerminal && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Move to:</span>
              {validNext.map((s) => {
                const isLost = s === "LOST";
                const isWon = s === "WON";
                const isHold = s === "ON_HOLD";

                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={isWon ? "primary" : isLost ? "danger" : isHold ? "outline" : "outline"}
                    onClick={() => requestTransition(s, statusLabel(s), s, "legacy")}
                    disabled={isPending}
                  >
                    {statusLabel(s)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Terminal / Recovery (Legacy) ─────── */}
        {(isTerminal || (isSideTrackLegacy && validNext.length > 0)) && (
          <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon name="info" size={14} />
                {isTerminal
                  ? `This lead has reached a terminal state (${statusLabel(currentStatus)}).`
                  : `This lead is currently ${statusLabel(currentStatus)}.`}
              </div>
              {(currentStatus === "LOST" || currentStatus === "ON_HOLD") && validNext.length > 0 && (
                <div className="flex gap-2">
                  {validNext.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="primary"
                      onClick={() => requestTransition(s, statusLabel(s), s, "legacy")}
                      disabled={isPending}
                    >
                      <Icon name="rotate-ccw" size={14} />
                      Reopen as {statusLabel(s)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Confirmation Modal (shared) ──────── */}
        {renderConfirmationModal()}
      </div>
    );
  }

  // ── No workflow and no lead data ──
  if (!hasWorkflow) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-400">No workflow pipeline configured.</p>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // WORKFLOW PIPELINE (workflow is configured)
  // ────────────────────────────────────────────────────────────

  const currentCode = workflowStatus.currentState.code;
  const isSideTrack = SIDE_TRACK_CODES.has(currentCode);

  return (
    <div>
      {/* ── Arrow Pipeline Stepper ──────────────────────────── */}
      <div className="flex items-stretch overflow-x-auto pb-2">
        {mainStates.map((state: WorkflowState, idx: number) => {
          const isCompleted = !isSideTrack && state.sortOrder < currentSortOrder;
          const isCurrent = state.code === currentCode;
          const isFuture = !isCompleted && !isCurrent;
          const isFirst = idx === 0;
          const isLast = idx === mainStates.length - 1;

          const palette = STEP_PALETTE[idx % STEP_PALETTE.length];

          // Arrow notch size
          const notch = 14;

          return (
            <div
              key={state.id}
              className="relative flex items-center"
              style={{ marginLeft: isFirst ? 0 : -1 }}
            >
              <div
                className="relative flex items-center justify-center px-4 py-2 transition-all"
                style={{
                  minWidth: 110,
                  background: isFuture ? palette.light : palette.bg,
                  color: isFuture ? palette.text : "#fff",
                  clipPath: isFirst
                    ? `polygon(0 0, calc(100% - ${notch}px) 0, 100% 50%, calc(100% - ${notch}px) 100%, 0 100%)`
                    : isLast
                      ? `polygon(${notch}px 0, 100% 0, 100% 100%, 0 100%, ${notch}px 50%)`
                      : `polygon(${notch}px 0, calc(100% - ${notch}px) 0, 100% 50%, calc(100% - ${notch}px) 100%, 0 100%, ${notch}px 50%)`,
                  paddingLeft: isFirst ? 16 : notch + 12,
                  paddingRight: isLast ? 16 : notch + 8,
                }}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold">
                  {isCompleted && <Icon name="check" size={13} />}
                  {isCurrent && <Icon name="circle" size={8} />}
                  {state.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Transition Buttons ─────────────────────────────── */}
      {transitions.length > 0 && workflowStatus.isActive && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Move to:</span>
            {transitions.map((t) => {
              const isLost = t.toState.code === "LOST";
              const isWon = t.toState.code === "WON";
              const isHold = t.toState.code === "ON_HOLD";

              return (
                <div key={t.id} className="inline-flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={
                      isWon
                        ? "primary"
                        : isLost
                          ? "danger"
                          : isHold
                            ? "outline"
                            : "outline"
                    }
                    onClick={() => requestTransition(t.code, t.name, t.toState.code)}
                    disabled={isPending}
                  >
                    {t.triggerType === "APPROVAL" && (
                      <Icon name="shield-check" size={14} />
                    )}
                    {t.name}
                  </Button>
                  <button
                    type="button"
                    className="text-gray-300 hover:text-gray-500"
                    title="Add comment"
                    onClick={() =>
                      setShowCommentFor(showCommentFor === t.code ? null : t.code)
                    }
                  >
                    <Icon name="message-square" size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comment input */}
          {showCommentFor && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Add a comment for this transition..."
                value={transitionComment}
                onChange={(e) => setTransitionComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && showCommentFor) {
                    const t = transitions.find((tr) => tr.code === showCommentFor);
                    if (t) requestTransition(t.code, t.name, t.toState.code);
                  }
                }}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (showCommentFor) {
                    const t = transitions.find((tr) => tr.code === showCommentFor);
                    if (t) requestTransition(t.code, t.name, t.toState.code);
                  }
                }}
                disabled={isPending}
              >
                <Icon name="send" size={14} /> Submit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Terminal state — show recovery options for LOST/ON_HOLD */}
      {!workflowStatus.isActive && (
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon name="info" size={14} />
              This lead has reached a terminal state ({workflowStatus.currentState.name}).
            </div>
            {(currentCode === "LOST" || currentCode === "ON_HOLD") && transitions.length > 0 && (
              <div className="flex gap-2">
                {transitions.map((t) => (
                  <Button
                    key={t.id}
                    size="sm"
                    variant="primary"
                    onClick={() => requestTransition(t.code, t.name, t.toState.code)}
                    disabled={isPending}
                  >
                    <Icon name="rotate-ccw" size={14} />
                    {t.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ────────────────────────────── */}
      {renderConfirmationModal()}
    </div>
  );

  // ── Shared Confirmation Modal ──────────────────────────
  function renderConfirmationModal() {
    return (
      <Modal
        open={!!confirmTransition}
        onClose={() => setConfirmTransition(null)}
        title="Confirm Status Change"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmTransition(null)}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirmTransition?.toStateCode === "LOST"
                  ? "danger"
                  : "primary"
              }
              onClick={handleConfirm}
              loading={isPending}
            >
              {confirmTransition?.toStateCode === "LOST"
                ? "Mark as Lost"
                : confirmTransition?.toStateCode === "WON"
                  ? "Mark as Won"
                  : "Confirm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to move this lead to{" "}
            <strong>{confirmTransition?.name}</strong>?
            {confirmTransition?.toStateCode === "LOST" && (
              <span className="mt-1 block text-xs text-red-500">
                This will mark the lead as lost. You can recover it later from the pipeline.
              </span>
            )}
          </p>
          <Input
            label="Reason (optional)"
            leftIcon={<Icon name="message-square" size={16} />}
            value={confirmReason}
            onChange={(v) => setConfirmReason(v)}
            placeholder="Add a reason for this status change..."
          />
        </div>
      </Modal>
    );
  }
}
