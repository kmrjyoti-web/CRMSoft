/**
 * React AICTable component.
 * A complex data table with multiple view modes, sorting, filtering,
 * pagination, and toolbar.
 *
 * Source: Angular aic-table component
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";

import {
  cn,
  createDefaultTableState,
  getVisibleColumns,
  getChoosableColumns,
  toggleSortDirection,
  sortData,
  filterDataByGlobalTerm,
  hasActiveFilters,
  getTotalPages,
  paginateData,
  getPageRange,
  getDensitySetting,
  calculateFooterValue,
} from "@coreui/ui";

import type {
  AICTableProps,
  ViewMode,
  AICTableDensity as Density,
  ActiveFilter,
  TableColumn,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  table: "Table",
  card: "Card",
  list: "List",
  bi: "BI",
  calendar: "Calendar",
  map: "Map",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICTable with multiple view modes (table, card, list),
 * sorting, filtering, pagination, toolbar, column chooser, density control,
 * export, and multi-select.
 */
export const AICTable: React.FC<AICTableProps> = ({
  config,
  data = [],
  loading = false,
  totalRecords,
  className,
  onRowClick,
  onRowAction,
  onToolbarAction,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  onSelectionChange,
  onExport,
  onViewModeChange,
}) => {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  const defaultState = useMemo(() => createDefaultTableState(config), [config]);

  const [viewMode, setViewMode] = useState<ViewMode>(defaultState.viewMode);
  const [currentPage, setCurrentPage] = useState(defaultState.currentPage);
  const [pageSize, setPageSize] = useState(defaultState.pageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultState.sortColumn
  );
  const [sortDirection, setSortDirection] = useState(
    defaultState.sortDirection
  );
  const [globalFilterTerm, setGlobalFilterTerm] = useState(
    defaultState.globalFilterTerm
  );
  const [advancedFilters, setAdvancedFilters] = useState<
    Record<string, ActiveFilter>
  >(defaultState.advancedFilters);
  const [visibleColumnCodes, setVisibleColumnCodes] = useState<string[]>(
    defaultState.visibleColumnCodes
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [density, setDensity] = useState<Density>(
    config.config.sizerConfig.defaultDensity
  );

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const visibleColumns = useMemo(
    () => getVisibleColumns(config.columns, visibleColumnCodes),
    [config.columns, visibleColumnCodes]
  );

  const choosableColumns = useMemo(
    () => getChoosableColumns(config.columns),
    [config.columns]
  );

  const searchFields = config.config.searchConfig?.fields;

  const processedData = useMemo(() => {
    let result = data as Record<string, unknown>[];

    // Global filter
    if (globalFilterTerm) {
      result = filterDataByGlobalTerm(result, globalFilterTerm, searchFields);
    }

    // Sort
    if (sortColumn) {
      result = sortData(result, sortColumn, sortDirection);
    }

    return result;
  }, [data, globalFilterTerm, searchFields, sortColumn, sortDirection]);

  const effectiveTotalRecords = totalRecords ?? processedData.length;

  const totalPages = useMemo(
    () => getTotalPages(effectiveTotalRecords, pageSize),
    [effectiveTotalRecords, pageSize]
  );

  const pageRange = useMemo(
    () => getPageRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const paginatedData = useMemo(() => {
    // If totalRecords is provided externally, assume data is already paginated
    if (totalRecords != null) return processedData;
    return paginateData(processedData, currentPage, pageSize);
  }, [processedData, currentPage, pageSize, totalRecords]);

  const densitySetting = useMemo(
    () => getDensitySetting(config, density),
    [config, density]
  );

  const primaryKey = config.config.primaryKey ?? "id";

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleSortClick = useCallback(
    (columnCode: string) => {
      const newDirection =
        sortColumn === columnCode ? toggleSortDirection(sortDirection) : "asc";
      setSortColumn(columnCode);
      setSortDirection(newDirection);
      onSortChange?.(columnCode, newDirection);
    },
    [sortColumn, sortDirection, onSortChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [totalPages, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
      onPageSizeChange?.(newSize);
    },
    [onPageSizeChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const debounceTime = config.config.searchConfig?.debounceTime ?? 300;

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setGlobalFilterTerm(value);
        setCurrentPage(1);
      }, debounceTime);
    },
    [config.config.searchConfig?.debounceTime]
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      setShowViewOptions(false);
      onViewModeChange?.(mode);
    },
    [onViewModeChange]
  );

  const handleColumnToggle = useCallback(
    (code: string) => {
      setVisibleColumnCodes((prev) => {
        if (prev.includes(code)) {
          return prev.filter((c) => c !== code);
        }
        return [...prev, code];
      });
    },
    []
  );

  const handleRowSelect = useCallback(
    (rowId: string) => {
      setSelectedIds((prev) => {
        const next = prev.includes(rowId)
          ? prev.filter((id) => id !== rowId)
          : [...prev, rowId];
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.length === paginatedData.length) {
        onSelectionChange?.([]);
        return [];
      }
      const allIds = paginatedData.map(
        (row) => String((row as Record<string, unknown>)[primaryKey] ?? "")
      );
      onSelectionChange?.(allIds);
      return allIds;
    });
  }, [paginatedData, primaryKey, onSelectionChange]);

  const handleExport = useCallback(
    (format: "csv" | "pdf" | "excel") => {
      setShowExportOptions(false);
      onExport?.(format);
    },
    [onExport]
  );

  const handleToolbarAction = useCallback(
    (key: string) => {
      onToolbarAction?.(key);
    },
    [onToolbarAction]
  );

  const handleRowClick = useCallback(
    (row: unknown) => {
      onRowClick?.(row);
    },
    [onRowClick]
  );

  const handleRowAction = useCallback(
    (action: string, row: unknown) => {
      onRowAction?.(action, row);
    },
    [onRowAction]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderCellValue = (row: Record<string, unknown>, col: TableColumn) => {
    const value = row[col.code];
    if (value == null) return "";
    return String(value);
  };

  const renderSortIndicator = (col: TableColumn) => {
    if (!col.sortable) return null;
    if (sortColumn !== col.code) {
      return (
        <span
          className="ml-1 text-slate-300"
          data-testid={`sort-indicator-${col.code}`}
        >
          &#8597;
        </span>
      );
    }
    return (
      <span
        className="ml-1 text-blue-600"
        data-testid={`sort-indicator-${col.code}`}
      >
        {sortDirection === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  };

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------

  const renderLoadingSkeleton = () => (
    <div
      className="animate-pulse space-y-3 p-4"
      data-testid="aic-table-loading"
    >
      {Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {visibleColumns.map((col) => (
            <div
              key={col.code}
              className="h-4 bg-slate-200 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------

  const renderEmptyState = () => {
    const emptyConfig = config.config.emptyStateConfig;
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4"
        data-testid="aic-table-empty"
      >
        {emptyConfig?.imageUrl && (
          <img
            src={emptyConfig.imageUrl}
            alt="No data"
            className="w-32 h-32 mb-4 opacity-50"
          />
        )}
        <h3 className="text-lg font-semibold text-slate-600 mb-1">
          {emptyConfig?.title ?? "No data available"}
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {emptyConfig?.subtitle ?? "There are no records to display."}
        </p>
        {emptyConfig?.actions?.map((action) => (
          <button
            key={action.key}
            className={cn(
              "px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700",
              action.class
            )}
            onClick={() => handleToolbarAction(action.key)}
            data-testid={`empty-action-${action.key}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Table view
  // -----------------------------------------------------------------------

  const renderTableView = () => (
    <div className="overflow-x-auto" data-testid="aic-table-view-table">
      <table className="w-full border-collapse">
        <thead>
          <tr
            className={cn(
              "border-b border-slate-200",
              config.config.styleConfig?.headerBackgroundColor
                ? undefined
                : "bg-slate-50"
            )}
            style={
              config.config.styleConfig?.headerBackgroundColor
                ? {
                    backgroundColor:
                      config.config.styleConfig.headerBackgroundColor,
                  }
                : undefined
            }
          >
            {config.config.enableMultiSelect && (
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.length === paginatedData.length
                  }
                  onChange={handleSelectAll}
                  data-testid="aic-table-select-all"
                  aria-label="AICSelect all rows"
                />
              </th>
            )}
            {visibleColumns.map((col) => (
              <th
                key={col.code}
                className={cn(
                  "px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.sortable && "cursor-pointer select-none hover:text-slate-800"
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={
                  col.sortable
                    ? () => handleSortClick(col.code)
                    : undefined
                }
                data-testid={`aic-table-header-${col.code}`}
              >
                <span className="inline-flex items-center">
                  {col.header ?? col.display}
                  {renderSortIndicator(col)}
                </span>
              </th>
            ))}
            {config.config.enableQuickActions && config.rowActions && (
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, rowIndex) => {
            const record = row as Record<string, unknown>;
            const rowId = String(record[primaryKey] ?? rowIndex);
            const isSelected = selectedIds.includes(rowId);

            return (
              <tr
                key={rowId}
                className={cn(
                  "border-b border-slate-100 transition-colors",
                  config.config.stripedRows &&
                    rowIndex % 2 === 1 &&
                    "bg-slate-25",
                  config.config.rowHover && "hover:bg-slate-50",
                  isSelected && "bg-blue-50",
                  densitySetting.cssClass
                )}
                style={{ height: densitySetting.rowHeight }}
                onClick={() => handleRowClick(row)}
                data-testid={`aic-table-row-${rowIndex}`}
              >
                {config.config.enableMultiSelect && (
                  <td className="px-3 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelect(rowId);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`aic-table-row-checkbox-${rowIndex}`}
                      aria-label={`AICSelect row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {visibleColumns.map((col) => (
                  <td
                    key={col.code}
                    className={cn(
                      "px-3 py-2 text-sm text-slate-700",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right"
                    )}
                    data-testid={`aic-table-cell-${rowIndex}-${col.code}`}
                  >
                    {renderCellValue(record, col)}
                  </td>
                ))}
                {config.config.enableQuickActions && config.rowActions && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {config.rowActions.map((action) => (
                        <button
                          key={action.action}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowAction(action.action, row);
                          }}
                          title={action.label}
                          data-testid={`row-action-${rowIndex}-${action.action}`}
                        >
                          <span className="text-xs">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        {config.config.footerConfig?.enabled &&
          config.config.footerConfig.columns.length > 0 && (
            <tfoot>
              <tr
                className="border-t-2 border-slate-200 bg-slate-50 font-semibold"
                data-testid="aic-table-footer"
              >
                {config.config.enableMultiSelect && <td className="px-3 py-2" />}
                {visibleColumns.map((col) => {
                  const footerCol = config.config.footerConfig!.columns.find(
                    (fc) => fc.code === col.code
                  );
                  return (
                    <td
                      key={col.code}
                      className={cn(
                        "px-3 py-2 text-sm",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                      data-testid={`aic-table-footer-${col.code}`}
                    >
                      {footerCol
                        ? `${footerCol.display}: ${calculateFooterValue(
                            processedData as Record<string, unknown>[],
                            footerCol
                          )}`
                        : ""}
                    </td>
                  );
                })}
                {config.config.enableQuickActions && config.rowActions && (
                  <td className="px-3 py-2" />
                )}
              </tr>
            </tfoot>
          )}
      </table>
    </div>
  );

  // -----------------------------------------------------------------------
  // Card view
  // -----------------------------------------------------------------------

  const cardsPerRow = config.config.cardViewConfig?.cardsPerRow ?? 3;

  const renderCardView = () => (
    <div
      className={cn("grid gap-4 p-4")}
      style={{
        gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
      }}
      data-testid="aic-table-view-card"
    >
      {paginatedData.map((row, rowIndex) => {
        const record = row as Record<string, unknown>;
        const rowId = String(record[primaryKey] ?? rowIndex);

        return (
          <div
            key={rowId}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleRowClick(row)}
            data-testid={`aic-table-card-${rowIndex}`}
          >
            {visibleColumns.map((col) => (
              <div key={col.code} className="mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  {col.header ?? col.display}
                </span>
                <p className="text-sm text-slate-700">
                  {renderCellValue(record, col)}
                </p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  // -----------------------------------------------------------------------
  // List view
  // -----------------------------------------------------------------------

  const renderListView = () => (
    <div className="divide-y divide-slate-100" data-testid="aic-table-view-list">
      {paginatedData.map((row, rowIndex) => {
        const record = row as Record<string, unknown>;
        const rowId = String(record[primaryKey] ?? rowIndex);

        return (
          <div
            key={rowId}
            className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
            onClick={() => handleRowClick(row)}
            data-testid={`aic-table-list-item-${rowIndex}`}
          >
            {visibleColumns.map((col, i) => (
              <div
                key={col.code}
                className={cn(
                  "text-sm",
                  i === 0
                    ? "font-medium text-slate-800 flex-1"
                    : "text-slate-500"
                )}
              >
                {renderCellValue(record, col)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  // -----------------------------------------------------------------------
  // Paginator
  // -----------------------------------------------------------------------

  const renderPaginator = () => (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-slate-200",
        config.config.styleConfig?.footerBackgroundColor
          ? undefined
          : "bg-white"
      )}
      style={
        config.config.styleConfig?.footerBackgroundColor
          ? {
              backgroundColor:
                config.config.styleConfig.footerBackgroundColor,
            }
          : undefined
      }
      data-testid="aic-table-paginator"
    >
      {/* Left: Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="text-sm border border-slate-200 rounded px-2 py-1 bg-white"
          data-testid="aic-table-page-size"
        >
          {PAGE_SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Center: Record info */}
      <span className="text-sm text-slate-500" data-testid="aic-table-page-info">
        {Math.min((currentPage - 1) * pageSize + 1, effectiveTotalRecords)}
        {" - "}
        {Math.min(currentPage * pageSize, effectiveTotalRecords)} of{" "}
        {effectiveTotalRecords}
      </span>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-1">
        <button
          className={cn(
            "px-2 py-1 text-sm rounded",
            currentPage <= 1
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-100"
          )}
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          data-testid="aic-table-prev-page"
          aria-label="Previous page"
        >
          &lsaquo;
        </button>

        {pageRange.map((page) => (
          <button
            key={page}
            className={cn(
              "px-3 py-1 text-sm rounded",
              page === currentPage
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            onClick={() => handlePageChange(page)}
            data-testid={`aic-table-page-${page}`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          className={cn(
            "px-2 py-1 text-sm rounded",
            currentPage >= totalPages
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-100"
          )}
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          data-testid="aic-table-next-page"
          aria-label="Next page"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );

  // -----------------------------------------------------------------------
  // Column chooser panel
  // -----------------------------------------------------------------------

  const renderColumnChooser = () => (
    <div
      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-3 min-w-[200px]"
      data-testid="aic-table-column-chooser"
    >
      <h4 className="text-sm font-semibold text-slate-700 mb-2">Columns</h4>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {choosableColumns.map((col) => (
          <label
            key={col.code}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer py-1"
          >
            <input
              type="checkbox"
              checked={visibleColumnCodes.includes(col.code)}
              onChange={() => handleColumnToggle(col.code)}
              data-testid={`column-chooser-${col.code}`}
            />
            {col.display}
          </label>
        ))}
      </div>
    </div>
  );

  // -----------------------------------------------------------------------
  // View mode selector
  // -----------------------------------------------------------------------

  const renderViewModeSelector = () => (
    <div
      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-2 min-w-[140px]"
      data-testid="aic-table-view-selector"
    >
      {(Object.keys(VIEW_MODE_LABELS) as ViewMode[]).map((mode) => (
        <button
          key={mode}
          className={cn(
            "w-full text-left px-3 py-1.5 text-sm rounded",
            viewMode === mode
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-slate-600 hover:bg-slate-50"
          )}
          onClick={() => handleViewModeChange(mode)}
          data-testid={`view-mode-${mode}`}
        >
          {VIEW_MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );

  // -----------------------------------------------------------------------
  // Export dropdown
  // -----------------------------------------------------------------------

  const renderExportDropdown = () => {
    const exportConfig = config.config.exportConfig;
    if (!exportConfig?.enabled) return null;

    return (
      <div
        className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-2 min-w-[140px]"
        data-testid="aic-table-export-menu"
      >
        {exportConfig.options.map((opt) => (
          <button
            key={opt.key}
            className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded"
            onClick={() => handleExport(opt.key)}
            data-testid={`export-option-${opt.key}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const showSearch = config.config.searchConfig?.enabled !== false;
  const showExport = config.config.exportConfig?.enabled === true;
  const showDensity = config.config.sizerConfig.enabled;

  return (
    <div
      className={cn(
        "border border-slate-200 rounded-lg bg-white overflow-hidden",
        config.config.styleConfig?.enableTransparency && "bg-opacity-80",
        className
      )}
      data-testid="aic-table"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-slate-200"
        data-testid="aic-table-header"
      >
        {/* Left: Title and record count */}
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold text-slate-800"
            data-testid="aic-table-title"
          >
            {config.config.title}
          </h2>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
            data-testid="aic-table-record-count"
          >
            {effectiveTotalRecords}
          </span>
          {hasActiveFilters(advancedFilters) && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              data-testid="aic-table-filter-badge"
            >
              Filtered
            </span>
          )}
        </div>

        {/* Right: Search, toolbar, controls */}
        <div className="flex items-center gap-2">
          {/* Global search */}
          {showSearch && (
            <input
              type="text"
              placeholder={
                config.config.searchConfig?.placeholder ?? "Search..."
              }
              onChange={handleSearchChange}
              className="text-sm border border-slate-200 rounded-md px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              data-testid="aic-table-search"
              aria-label="Search table"
            />
          )}

          {/* Toolbar actions */}
          {config.config.toolbarActions.map((action) => (
            <button
              key={action.key}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
              onClick={() => handleToolbarAction(action.key)}
              title={action.label}
              data-testid={`toolbar-action-${action.key}`}
            >
              {config.config.toolbarButtonMode !== "iconOnly" && (
                <span>{action.label}</span>
              )}
            </button>
          ))}

          {/* Column chooser toggle */}
          {config.config.enableColumnChooser && (
            <div className="relative">
              <button
                className={cn(
                  "p-1.5 rounded-md text-sm",
                  showColumnChooser
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                data-testid="aic-table-column-chooser-toggle"
                aria-label="Toggle column chooser"
              >
                Columns
              </button>
              {showColumnChooser && renderColumnChooser()}
            </div>
          )}

          {/* View mode selector */}
          <div className="relative">
            <button
              className={cn(
                "p-1.5 rounded-md text-sm",
                showViewOptions
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
              onClick={() => setShowViewOptions(!showViewOptions)}
              data-testid="aic-table-view-toggle"
              aria-label="AICSwitch view mode"
            >
              {VIEW_MODE_LABELS[viewMode]}
            </button>
            {showViewOptions && renderViewModeSelector()}
          </div>

          {/* Density selector */}
          {showDensity && (
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
              {config.config.sizerConfig.densities.map((d) => (
                <button
                  key={d.name}
                  className={cn(
                    "px-2 py-1 text-xs",
                    density === d.name
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                  onClick={() => setDensity(d.name)}
                  data-testid={`density-${d.name}`}
                  aria-label={`Set density to ${d.name}`}
                >
                  {d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Export button */}
          {showExport && (
            <div className="relative">
              <button
                className={cn(
                  "p-1.5 rounded-md text-sm",
                  showExportOptions
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => setShowExportOptions(!showExportOptions)}
                data-testid="aic-table-export-toggle"
                aria-label="Export data"
              >
                Export
              </button>
              {showExportOptions && renderExportDropdown()}
            </div>
          )}
        </div>
      </div>

      {/* ── Content area ────────────────────────────────── */}
      {loading ? (
        renderLoadingSkeleton()
      ) : paginatedData.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {viewMode === "table" && renderTableView()}
          {viewMode === "card" && renderCardView()}
          {viewMode === "list" && renderListView()}
        </>
      )}

      {/* ── Paginator ───────────────────────────────────── */}
      {!loading &&
        paginatedData.length > 0 &&
        config.config.pagingMode === "paginator" &&
        renderPaginator()}
    </div>
  );
};

AICTable.displayName = "AICTable";
