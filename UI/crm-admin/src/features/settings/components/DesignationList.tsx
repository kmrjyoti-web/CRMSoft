"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useDesignationsList } from "../hooks/useDesignations";
import { DesignationForm } from "./DesignationForm";
import type { DesignationItem, DesignationListParams } from "../types/designation.types";

// ── Column definitions ──────────────────────────────────

const DESIG_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "grade", label: "Grade", visible: true },
  { id: "level", label: "Level", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// ── Helpers ─────────────────────────────────────────────

function flattenDesignations(items: DesignationItem[]): Record<string, unknown>[] {
  return items.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    grade: d.grade ?? "\u2014",
    level: d.level,
    status: d.isActive ? "Active" : "Inactive",
    createdAt: d.createdAt
      ? new Date(d.createdAt).toLocaleDateString("en-IN")
      : "\u2014",
  }));
}

// ── Component ───────────────────────────────────────────

export function DesignationList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "designation",
    entityLabel: "Designation",
    FormComponent: DesignationForm,
    idProp: "designationId",
    editRoute: "/settings/designations/:id/edit",
    createRoute: "/settings/designations/new",
    displayField: "name",
  });

  const params = useMemo<DesignationListParams>(
    () => ({ page: 1, limit: 10000 }),
    [],
  );

  const { data, isLoading } = useDesignationsList(params);

  const responseData = data?.data;
  const items: DesignationItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: DesignationItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenDesignations(items), [items]);

  if (isLoading) return <TableSkeleton title="Designations" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Designations"
        columns={DESIG_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
