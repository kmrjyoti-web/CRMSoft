"use client";

import { useRouter } from "next/navigation";

import { useDraggable } from "@dnd-kit/core";

import { Badge, Avatar } from "@/components/ui";

import type { LeadListItem } from "../types/leads.types";

// ── Props ────────────────────────────────────────────────

interface KanbanCardProps {
  lead: LeadListItem;
}

// ── Component ────────────────────────────────────────────

export function KanbanCard({ lead }: KanbanCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const assigneeInitials = lead.allocatedTo
    ? `${lead.allocatedTo.firstName[0]}${lead.allocatedTo.lastName[0]}`
    : null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`cursor-grab rounded-md border border-gray-200 bg-white p-3 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => router.push(`/leads/${lead.id}`)}
    >
      <p className="text-sm font-medium">
        {lead.leadNumber} — {lead.contact.firstName}
      </p>

      <div className="mt-2 flex items-center justify-between">
        {lead.expectedValue != null ? (
          <Badge variant="secondary">
            ₹ {lead.expectedValue.toLocaleString("en-IN")}
          </Badge>
        ) : (
          <span />
        )}

        {assigneeInitials && (
          <Avatar fallback={assigneeInitials} size="sm" />
        )}
      </div>
    </div>
  );
}
