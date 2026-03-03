"use client";

import { useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { TableFull } from "@/components/ui";

import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useLookupsList } from "../hooks/useLookups";

import type { LookupListItem } from "../types/lookup.types";

// ── Column definitions ──────────────────────────────────

const LOOKUP_COLUMNS = [
  { id: "category", label: "Category Code", visible: true },
  { id: "displayName", label: "Display Name", visible: true },
  { id: "description", label: "Description", visible: true },
  { id: "valuesCount", label: "Values", visible: true },
  { id: "isSystem", label: "System", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// ── Helpers ─────────────────────────────────────────────

function flattenLookups(lookups: LookupListItem[]): Record<string, unknown>[] {
  return lookups.map((l) => ({
    id: l.id,
    category: l.category,
    displayName: l.displayName,
    description: l.description ?? "—",
    valuesCount: l._count?.values ?? 0,
    isSystem: l.isSystem ? "Yes" : "No",
    status: l.isActive ? "Active" : "Inactive",
    createdAt: l.createdAt
      ? new Date(l.createdAt).toLocaleDateString()
      : "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function LookupList() {
  const router = useRouter();

  const { data, isLoading, error } = useLookupsList(false);

  const responseData = data?.data;
  const lookups: LookupListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: LookupListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenLookups(lookups), [lookups]);

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/settings/lookups/${row.id}`);
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push("/settings/lookups/new");
  }, [router]);

  if (isLoading) return <TableSkeleton title="Lookup Master" />;

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load lookups</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Lookup Master"
        columns={LOOKUP_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
