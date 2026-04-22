"use client";

import { useState, useMemo, useCallback } from "react";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
} from "@dnd-kit/core";
import toast from "react-hot-toast";

import { Button, Icon, Modal, Input } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { KanbanColumn } from "./KanbanColumn";
import { useLeadsList, useChangeLeadStatus } from "../hooks/useLeads";

import type { LeadStatus, LeadListItem } from "../types/leads.types";

// ── Pipeline order ───────────────────────────────────────

const PIPELINE: LeadStatus[] = [
  "NEW",
  "VERIFIED",
  "ALLOCATED",
  "IN_PROGRESS",
  "DEMO_SCHEDULED",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

// ── Status label helper ──────────────────────────────────

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

// ── Component ────────────────────────────────────────────

export function LeadKanban() {
  const { data, isLoading } = useLeadsList({ limit: 200 });
  const changeStatusMutation = useChangeLeadStatus();

  // Confirmation dialog state
  const [pendingMove, setPendingMove] = useState<{
    leadId: string;
    newStatus: LeadStatus;
    leadName: string;
  } | null>(null);
  const [moveReason, setMoveReason] = useState("");

  const leads = useMemo(() => data?.data ?? [], [data]);

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, LeadListItem[]> = {} as Record<
      LeadStatus,
      LeadListItem[]
    >;
    for (const status of PIPELINE) {
      map[status] = [];
    }
    for (const lead of leads) {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      }
    }
    return map;
  }, [leads]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as LeadStatus;

      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status === newStatus) return;

      // Show confirmation dialog instead of moving immediately
      const name = lead.contactFirstName
        ? `${lead.contactFirstName} ${lead.contactLastName ?? ""}`.trim()
        : lead.leadNumber;
      setPendingMove({ leadId, newStatus, leadName: name });
      setMoveReason("");
    },
    [leads],
  );

  const confirmMove = useCallback(async () => {
    if (!pendingMove) return;
    try {
      await changeStatusMutation.mutateAsync({
        id: pendingMove.leadId,
        status: pendingMove.newStatus,
        reason: moveReason || undefined,
      });
      toast.success(`Lead moved to ${statusLabel(pendingMove.newStatus)}`);
      setPendingMove(null);
      setMoveReason("");
    } catch {
      toast.error("Failed to move lead");
    }
  }, [pendingMove, changeStatusMutation, moveReason]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={grouped[status]}
            />
          ))}
        </div>
        <DragOverlay />
      </DndContext>

      {/* ── Confirmation Modal ── */}
      <Modal
        open={!!pendingMove}
        onClose={() => setPendingMove(null)}
        title="Confirm Status Change"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingMove?.newStatus === "LOST" ? "danger" : "primary"}
              onClick={confirmMove}
              loading={changeStatusMutation.isPending}
            >
              {pendingMove?.newStatus === "LOST"
                ? "Mark as Lost"
                : pendingMove?.newStatus === "WON"
                  ? "Mark as Won"
                  : "Confirm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to move{" "}
            <strong>{pendingMove?.leadName}</strong> to{" "}
            <strong>{pendingMove ? statusLabel(pendingMove.newStatus) : ""}</strong>?
            {pendingMove?.newStatus === "LOST" && (
              <span className="mt-1 block text-xs text-red-500">
                This will mark the lead as lost. You can recover it later from the lead detail pipeline.
              </span>
            )}
          </p>
          <Input
            label="Reason (optional)"
            leftIcon={<Icon name="message-square" size={16} />}
            value={moveReason}
            onChange={(v) => setMoveReason(v)}
            placeholder="Add a reason for this status change..."
          />
        </div>
      </Modal>
    </>
  );
}
