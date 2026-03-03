"use client";

import { useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useInstallationsList } from "../hooks/usePostSales";

import { INSTALLATION_FILTER_CONFIG } from "../utils/installation-filters";

import type {
  InstallationListItem,
  InstallationListParams,
} from "../types/post-sales.types";

// ── Column definitions ──────────────────────────────────

const INSTALLATION_COLUMNS = [
  { id: "installationNo", label: "Installation No", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "contact", label: "Contact / Org", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "scheduledDate", label: "Scheduled Date", visible: true },
  { id: "assignedTo", label: "Assigned To", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenInstallations(
  items: InstallationListItem[],
): Record<string, unknown>[] {
  return items.map((item) => ({
    id: item.id,
    installationNo: item.installationNo,
    title: item.title || "—",
    contact: item.contact
      ? `${item.contact.firstName} ${item.contact.lastName}${item.organization ? ` (${item.organization.name})` : ""}`
      : "—",
    status: item.status,
    scheduledDate: item.scheduledDate
      ? new Date(item.scheduledDate).toLocaleDateString("en-IN")
      : "—",
    assignedTo: item.assignedTo
      ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}`
      : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function InstallationList() {
  const router = useRouter();

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(INSTALLATION_FILTER_CONFIG);

  const params = useMemo<InstallationListParams>(
    () => ({
      page: 1,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useInstallationsList(params);

  const responseData = data?.data;
  const items: InstallationListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as {
      data?: InstallationListItem[];
    };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenInstallations(items), [items]);

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/post-sales/installations/${row.id}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/post-sales/installations/new");
  }, [router]);

  if (isLoading) return <TableSkeleton title="Installations" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Installations"
        columns={INSTALLATION_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={INSTALLATION_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
