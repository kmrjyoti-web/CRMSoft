"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Button } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import {
  useWarrantyTemplates,
  useImportWarrantyTemplate,
} from "../hooks/useAmcWarranty";
import { WARRANTY_TEMPLATE_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type { WarrantyTemplate } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "industryCode", label: "Industry", visible: true },
  { id: "coverageType", label: "Coverage", visible: true },
  { id: "duration", label: "Duration", visible: true },
  { id: "systemBadge", label: "Type", visible: true },
  { id: "activeBadge", label: "Active", visible: true },
  { id: "recordCount", label: "Records", visible: false },
];

function flattenTemplates(
  items: WarrantyTemplate[],
  onImport: (id: string) => void,
): Record<string, unknown>[] {
  return items.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    industryCode: t.industryCode ?? "—",
    coverageType: t.coverageType,
    duration: `${t.durationValue} ${t.durationType.toLowerCase()}`,
    systemBadge: t.isSystemTemplate ? (
      <Badge variant="primary">System</Badge>
    ) : (
      <Badge variant="outline">Tenant</Badge>
    ),
    activeBadge: t.isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    ),
    recordCount: t._count?.records ?? 0,
    actions: t.isSystemTemplate ? (
      <Button
        size="sm"
        variant="outline"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onImport(t.id);
        }}
      >
        Import
      </Button>
    ) : null,
  }));
}

export function WarrantyTemplateList() {
  const importTemplate = useImportWarrantyTemplate();

  const handleImport = async (id: string) => {
    try {
      await importTemplate.mutateAsync(id);
      toast.success("Template imported successfully");
    } catch {
      toast.error("Failed to import template");
    }
  };

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(WARRANTY_TEMPLATE_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useWarrantyTemplates(params);

  const responseData = data?.data;
  const items: WarrantyTemplate[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: WarrantyTemplate[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(
    () => flattenTemplates(items, handleImport),
    [items, handleImport],
  );

  if (isLoading) return <TableSkeleton title="Warranty Templates" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Warranty Templates"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={WARRANTY_TEMPLATE_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onCreate={() => {}}
      />
    </div>
  );
}
