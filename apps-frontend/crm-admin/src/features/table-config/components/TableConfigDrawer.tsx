"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

import { Drawer, Button, Icon, Switch } from "@/components/ui";

import { useTableConfig } from "../hooks/useTableConfig";

import { ColumnConfigList } from "./ColumnConfigList";
import { FilterConfigList } from "./FilterConfigList";

import type { TableFilterConfig } from "@/components/ui/table-filter.types";

import type { ColumnConfig, TableConfigData, FilterLayoutSection } from "../types/table-config.types";

type Tab = "columns" | "filters" | "settings";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "columns", label: "Columns", icon: "columns-3" },
  { key: "filters", label: "Filters", icon: "filter" },
  { key: "settings", label: "Settings", icon: "settings" },
];

interface TableConfigDrawerProps {
  tableKey: string;
  filterConfig?: TableFilterConfig;
  /** IDs of filters that are visible by default (from static filter config). Others default to hidden. */
  defaultFilterIds?: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export function TableConfigDrawer({
  tableKey,
  filterConfig,
  defaultFilterIds,
  isOpen,
  onClose,
}: TableConfigDrawerProps) {
  const {
    columns: savedColumns,
    density: savedDensity,
    defaultViewMode: savedViewMode,
    showRowActions: savedShowRowActions,
    filterVisibility: savedFilterVisibility,
    filterLayout: savedFilterLayout,
    saveConfig,
    resetToDefault,
    isSaving,
  } = useTableConfig(tableKey);

  const [activeTab, setActiveTab] = useState<Tab>("columns");
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([]);
  const [density, setDensity] = useState<string>("compact");
  const [viewMode, setViewMode] = useState<string>("table");
  const [showRowActions, setShowRowActions] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState<Record<string, boolean>>({});
  const [filterLayout, setFilterLayout] = useState<FilterLayoutSection[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);

  // Build default layout from filterConfig sections
  const defaultLayout = useMemo((): FilterLayoutSection[] => {
    if (!filterConfig) return [];
    return filterConfig.sections.map((s) => ({
      title: s.title,
      filterIds: s.filters.map((f) => f.columnId),
    }));
  }, [filterConfig]);

  // Flat list of all filters for FilterConfigList
  const allFilters = useMemo(() => {
    if (!filterConfig) return [];
    return filterConfig.sections.flatMap((s) =>
      s.filters.map((f) => ({
        columnId: f.columnId,
        label: f.label,
        filterType: f.filterType,
      })),
    );
  }, [filterConfig]);

  // Sync local state when drawer opens or saved config changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("columns");
      setLocalColumns([...savedColumns]);
      setDensity(savedDensity ?? "compact");
      setViewMode(savedViewMode ?? "table");
      setShowRowActions(savedShowRowActions ?? true);
      setFilterVisibility(savedFilterVisibility ?? {});
      setFilterLayout(savedFilterLayout ?? defaultLayout);
      setApplyToAll(false);
    }
  }, [isOpen, savedColumns, savedDensity, savedViewMode, savedShowRowActions, savedFilterVisibility, savedFilterLayout, defaultLayout]);

  const handleSave = useCallback(async () => {
    const hasFilterChanges = Object.keys(filterVisibility).length > 0;
    const hasLayoutChanges = JSON.stringify(filterLayout) !== JSON.stringify(defaultLayout);
    const config: TableConfigData = {
      columns: localColumns,
      density: density as TableConfigData["density"],
      defaultViewMode: viewMode,
      showRowActions,
      ...(hasFilterChanges ? { filterVisibility } : {}),
      ...(hasLayoutChanges ? { filterLayout } : {}),
    };
    await saveConfig(config, applyToAll);
    onClose();
  }, [localColumns, density, viewMode, showRowActions, filterVisibility, filterLayout, defaultLayout, applyToAll, saveConfig, onClose]);

  const handleReset = useCallback(async () => {
    await resetToDefault();
    onClose();
  }, [resetToDefault, onClose]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      title="Table Settings"
      showCloseButton
    >
      <div className="flex flex-col h-full">
        {/* Tab Bar */}
        <div className="flex border-b bg-white px-2 pt-1 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* ── Tab 1: Columns ── */}
          {activeTab === "columns" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Drag to reorder, toggle visibility, click label to rename.
              </p>
              <ColumnConfigList
                columns={localColumns}
                onChange={setLocalColumns}
              />
            </div>
          )}

          {/* ── Tab 2: Filters ── */}
          {activeTab === "filters" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Drag to reorder, toggle visibility, change group, or create new groups.
              </p>
              {allFilters.length > 0 ? (
                <FilterConfigList
                  allFilters={allFilters}
                  layout={filterLayout}
                  visibility={filterVisibility}
                  defaultFilterIds={defaultFilterIds ?? new Set()}
                  onLayoutChange={setFilterLayout}
                  onVisibilityChange={setFilterVisibility}
                />
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  No filters available for this table.
                </p>
              )}
            </div>
          )}

          {/* ── Tab 3: Settings ── */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Row Actions */}
              <section>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Row Actions
                </h4>
                <div className="flex items-center gap-3 text-sm">
                  <Switch
                    size="sm"
                    checked={showRowActions}
                    onChange={(val) => setShowRowActions(val)}
                  />
                  <span className="text-gray-600">
                    Show actions menu (Edit, Copy, Archive, Delete)
                  </span>
                </div>
              </section>

              {/* Density */}
              <section>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Density
                </h4>
                <div className="flex gap-2">
                  {(["compact", "cozy", "comfortable"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={`px-3 py-1.5 text-sm rounded border ${
                        density === d
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </section>

              {/* Default View */}
              <section>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Default View
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["table", "list", "card", "calendar", "kanban"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setViewMode(v)}
                      className={`px-3 py-1.5 text-sm rounded border ${
                        viewMode === v
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </section>

              {/* Save Scope */}
              <section>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Save Scope
                </h4>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={!applyToAll}
                      onChange={() => setApplyToAll(false)}
                      className="text-blue-600"
                    />
                    Save for me
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={applyToAll}
                      onChange={() => setApplyToAll(true)}
                      className="text-blue-600"
                    />
                    Save for all users
                  </label>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
