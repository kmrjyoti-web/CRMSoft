"use client";

import { useDroppable } from "@dnd-kit/core";

import { KanbanCard } from "./KanbanCard";

import type { LeadStatus, LeadListItem } from "../types/leads.types";

// ── Props ────────────────────────────────────────────────

interface KanbanColumnProps {
  status: LeadStatus;
  leads: LeadListItem[];
}

// ── Component ────────────────────────────────────────────

export function KanbanColumn({ status, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 min-w-[16rem] flex-shrink-0 flex-col rounded-lg border bg-gray-50 ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <span className="text-xs font-semibold uppercase text-gray-500">
          {status.replace(/_/g, " ")}
        </span>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 p-2">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
