"use client";

import { useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";

import { useLookupsList, useDeactivateLookup, useResetLookupDefaults } from "../hooks/useLookups";

import { LookupForm } from "./LookupForm";

import { LOOKUP_FILTER_CONFIG } from "../utils/lookup-filters";

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
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const deactivateMutation = useDeactivateLookup();
  const resetMutation = useResetLookupDefaults();

  const { handleCreate } = useEntityPanel({
    entityKey: "lookup",
    entityLabel: "Lookup",
    FormComponent: LookupForm,
    idProp: "lookupId",
    editRoute: "/settings/lookups/:id",
    createRoute: "/settings/lookups/new",
    displayField: "displayName",
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(LOOKUP_FILTER_CONFIG);

  const { data, isLoading, error } = useLookupsList(false);

  const responseData = data?.data;
  const lookups: LookupListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: LookupListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenLookups(lookups), [lookups]);

  // Navigate to detail page on row click/edit
  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/settings/lookups/${row.id}`);
    },
    [router],
  );

  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Deactivate Lookup",
        message: `Deactivate "${row.displayName}"? This will hide it from dropdowns.`,
        type: "danger",
        confirmText: "Deactivate",
      });
      if (!ok) return;
      try {
        await deactivateMutation.mutateAsync(row.id as string);
        toast.success("Lookup deactivated");
      } catch {
        toast.error("Failed to deactivate lookup");
      }
    },
    [confirm, deactivateMutation],
  );

  const handleResetDefaults = useCallback(async () => {
    const ok = await confirm({
      title: "Reset Lookup Defaults",
      message:
        "This will restore all system lookup categories and values to their defaults. Custom values will be preserved. Continue?",
      type: "danger",
      confirmText: "Reset Defaults",
    });
    if (!ok) return;
    try {
      await resetMutation.mutateAsync();
      toast.success("Lookup defaults restored");
    } catch {
      toast.error("Failed to reset lookup defaults");
    }
  }, [confirm, resetMutation]);

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
      {/* Reset Defaults */}
      <div className="shrink-0 px-4 pt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetDefaults}
          loading={resetMutation.isPending}
          disabled={resetMutation.isPending}
        >
          <Icon name="refresh" size={14} /> Reset Defaults
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Lookup Master"
          tableKey="lookups"
          columns={LOOKUP_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          filterConfig={LOOKUP_FILTER_CONFIG}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={clearFilters}
          onRowEdit={handleRowEdit}
          onRowDelete={handleRowDelete}
          onCreate={handleCreate}
        />
      </div>
      <ConfirmDialogPortal />
    </div>
  );
}
