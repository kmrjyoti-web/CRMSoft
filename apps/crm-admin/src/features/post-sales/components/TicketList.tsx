"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { TableSkeleton } from "@/components/common/TableSkeleton";

import { HelpButton } from "@/components/common/HelpButton";

import { useTicketsList } from "../hooks/usePostSales";

import { TicketForm } from "./TicketForm";
import { TicketListUserHelp } from "../help/TicketListUserHelp";
import { PostSalesDevHelp } from "../help/PostSalesDevHelp";

import { TICKET_FILTER_CONFIG } from "../utils/ticket-filters";

import type {
  TicketListItem,
  TicketListParams,
} from "../types/post-sales.types";

// ── Column definitions ──────────────────────────────────

const TICKET_COLUMNS = [
  { id: "ticketNo", label: "Ticket No", visible: true },
  { id: "subject", label: "Subject", visible: true },
  { id: "priority", label: "Priority", visible: true },
  { id: "category", label: "Category", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "assignedTo", label: "Assigned To", visible: true },
  { id: "createdAt", label: "Created At", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenTickets(
  items: TicketListItem[],
): Record<string, unknown>[] {
  return items.map((ticket) => ({
    id: ticket.id,
    ticketNo: ticket.ticketNo,
    subject: ticket.subject || "—",
    priority: ticket.priority,
    category: ticket.category,
    status: ticket.status,
    assignedTo: ticket.assignedTo
      ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
      : "—",
    createdAt: ticket.createdAt
      ? new Date(ticket.createdAt).toLocaleDateString("en-IN")
      : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function TicketList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "ticket",
    entityLabel: "Ticket",
    FormComponent: TicketForm,
    idProp: "ticketId",
    editRoute: "/post-sales/tickets/:id/edit",
    createRoute: "/post-sales/tickets/new",
    displayField: "ticketNo",
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(TICKET_FILTER_CONFIG);

  const params = useMemo<TicketListParams>(
    () => ({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useTicketsList(params);

  const responseData = data?.data;
  const items: TicketListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: TicketListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenTickets(items), [items]);

  if (isLoading) return <TableSkeleton title="Tickets" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Tickets"
        columns={TICKET_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={TICKET_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
        headerActions={
          <HelpButton
            panelId="tickets-list-help"
            title="Tickets — Help"
            userContent={<TicketListUserHelp />}
            devContent={<PostSalesDevHelp />}
          />
        }
      />
    </div>
  );
}
