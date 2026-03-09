"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { useDepartmentsList } from "../hooks/useDepartments";
import { DepartmentForm } from "./DepartmentForm";
import type { DepartmentItem, DepartmentListParams } from "../types/department.types";

// ── Column definitions ──────────────────────────────────

const DEPT_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "displayName", label: "Display Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "level", label: "Level", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: false },
];

// ── Helpers ─────────────────────────────────────────────

function flattenDepartments(items: DepartmentItem[]): Record<string, unknown>[] {
  return items.map((d) => ({
    id: d.id,
    name: d.name,
    displayName: d.displayName,
    code: d.code,
    level: d.level,
    status: d.isActive ? "Active" : "Inactive",
    createdAt: d.createdAt
      ? new Date(d.createdAt).toLocaleDateString("en-IN")
      : "\u2014",
  }));
}

// ── Component ───────────────────────────────────────────

export function DepartmentList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "department",
    entityLabel: "Department",
    FormComponent: DepartmentForm,
    idProp: "departmentId",
    editRoute: "/settings/departments/:id/edit",
    createRoute: "/settings/departments/new",
    displayField: "name",
  });

  const params = useMemo<DepartmentListParams>(
    () => ({ page: 1, limit: 10000 }),
    [],
  );

  const { data, isLoading } = useDepartmentsList(params);

  const responseData = data?.data;
  const items: DepartmentItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: DepartmentItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenDepartments(items), [items]);

  if (isLoading) return <TableSkeleton title="Departments" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Departments"
        columns={DEPT_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
