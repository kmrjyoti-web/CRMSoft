"use client";

import { useMemo, useCallback } from "react";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
} from "@dnd-kit/core";
import toast from "react-hot-toast";

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

// ── Component ────────────────────────────────────────────

export function LeadKanban() {
  const { data, isLoading } = useLeadsList({ limit: 200 });
  const changeStatusMutation = useChangeLeadStatus();

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
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as LeadStatus;

      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status === newStatus) return;

      try {
        await changeStatusMutation.mutateAsync({
          id: leadId,
          status: newStatus,
        });
        toast.success(`Lead moved to ${newStatus.replace(/_/g, " ")}`);
      } catch {
        toast.error("Failed to move lead");
      }
    },
    [leads, changeStatusMutation],
  );

  if (isLoading) return <LoadingSpinner />;

  return (
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
  );
}
