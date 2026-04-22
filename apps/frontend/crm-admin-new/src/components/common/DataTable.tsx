"use client";

import { useMemo } from "react";

import { Table } from "@/components/ui";

// ── Types ───────────────────────────────────────────────

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, any>[];
  totalRecords?: number;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  title?: string;
  selectable?: boolean;
  striped?: boolean;
  searchable?: boolean;
  rowActions?: { action: string; label: string; icon?: string }[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (column: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: unknown) => void;
  onRowAction?: (action: string, row: unknown) => void;
  onSelectionChange?: (ids: string[]) => void;
}

// ── Component ───────────────────────────────────────────

export function DataTable({
  columns,
  data,
  totalRecords,
  loading,
  title = "",
  selectable = false,
  striped = true,
  searchable = false,
  rowActions,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRowClick,
  onRowAction,
  onSelectionChange,
}: DataTableProps) {
  const tableConfig = useMemo(
    () => ({
      feature: title || "data",
      key: title || "data-table",
      api: {
        url: "",
        pathTable: "",
        pathExport: "",
        method: "GET",
        defaultPageSize: 10,
      },
      config: {
        id: title || "data-table",
        title,
        primaryKey: "id",
        dataStrategy: "OFFLINE_FIRST" as const,
        pagingMode: "paginator" as const,
        defaultRows: 10,
        role: "table",
        searchConfig: {
          enabled: searchable,
          fields: columns.map((c) => c.key),
          placeholder: "Search...",
          debounceTime: 300,
        },
        enableColumnChooser: false,
        enableMultiSelect: selectable,
        enableQuickActions: !!rowActions?.length,
        enableRowMenu: false,
        enableHeaderActions: false,
        enableSavedQueries: false,
        enableConfigButton: false,
        stripedRows: striped,
        rowHover: true,
        sizerConfig: {
          enabled: true,
          defaultDensity: "comfortable" as const,
          densities: [
            { name: "comfortable" as const, cssClass: "density-comfortable", rowHeight: 48 },
            { name: "compact" as const, cssClass: "density-compact", rowHeight: 36 },
            { name: "dense" as const, cssClass: "density-dense", rowHeight: 28 },
          ],
        },
        toolbarActions: [],
        toolbarButtonMode: "iconOnly" as const,
      },
      columns: columns.map((col, idx) => ({
        index: idx,
        name: col.key,
        code: col.key,
        display: col.label,
        sortable: col.sortable ?? false,
        width: col.width,
        align: col.align,
      })),
      rowMenu: [] as { label: string; items: { label: string; action?: string }[] }[],
      rowActions: rowActions?.map((a) => ({
        action: a.action,
        label: a.label,
        icon: a.icon ?? "circle",
      })),
    }),
    [columns, title, selectable, striped, searchable, rowActions],
  );

  return (
    <Table
      config={tableConfig}
      data={data}
      loading={loading}
      totalRecords={totalRecords}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSortChange={onSortChange}
      onRowClick={onRowClick}
      onRowAction={onRowAction}
      onSelectionChange={onSelectionChange}
    />
  );
}
