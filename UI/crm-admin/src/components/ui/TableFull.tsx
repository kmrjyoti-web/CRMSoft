'use client';

import { useState, useMemo, useCallback, useId, createElement, useEffect } from 'react';

import { AICTableFull } from '@coreui/ui-react';

import { useTableConfig } from '@/features/table-config/hooks/useTableConfig';
import { useDataMasking } from '@/features/table-config/hooks/useDataMasking';
import { TableConfigDrawer } from '@/features/table-config/components/TableConfigDrawer';
import { UnmaskButton } from '@/features/table-config/components/UnmaskButton';
import { ExportDropdown } from '@/features/table-config/components/ExportDropdown';
import { maskDisplayValue } from '@/features/table-config/utils/mask-utils';
import { exportData } from '@/features/table-config/utils/export-utils';
import type { ExportFormat } from '@/features/table-config/utils/export-utils';

import { Button } from './Button';
import { Icon } from './Icon';

type AICTableFullProps = React.ComponentProps<typeof AICTableFull>;

/** Auto-detect filter type from column id */
function inferFilterType(colId: string): 'text' | 'date' | 'number' | 'boolean' {
  const id = colId.toLowerCase();
  // Date columns
  if (id.endsWith('at') || id.endsWith('date') || id.includes('date') || id === 'dob' || id === 'birthday') return 'date';
  // Boolean columns
  if (id.startsWith('is') || id === 'active' || id === 'verified' || id === 'enabled' || id === 'archived') return 'boolean';
  // Number columns
  if (id.includes('amount') || id.includes('price') || id.includes('total') || id.includes('count') || id.includes('quantity') || id === 'age') return 'number';
  // Default
  return 'text';
}

interface TableFullProps extends AICTableFullProps {
  /** Enable table config system. When set, columns come from saved config + settings icon appears. */
  tableKey?: string;
  /** Predefined category values for Kanban view. Maps field name → all possible values. */
  kanbanCategoryOptions?: Record<string, string[]>;
}

export function TableFull({ tableKey, columns: staticColumns, data, headerActions, onRowEdit, onRowDelete, onRowCopy, onRowArchive, filterConfig, kanbanCategoryOptions, defaultCalendarSettings, ...rest }: TableFullProps) {
  const enabled = !!tableKey;
  const config = useTableConfig(tableKey);
  const { rules, unmask } = useDataMasking(tableKey);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unmaskedValues, setUnmaskedValues] = useState<Record<string, string>>({});
  const scopeId = useId().replace(/:/g, '');

  // Detect mobile for responsive defaults
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Use config columns only when loaded + non-empty; always fall back to static
  const configColumns = enabled && !config.isLoading ? config.visibleColumns : undefined;
  const effectiveColumns = configColumns && configColumns.length > 0
    ? configColumns
    : staticColumns;

  const showActions = enabled ? config.showRowActions : true;

  // Build all possible filter definitions: static filterConfig + auto-generated from columns
  const { allFilterConfig, staticFilterIds } = useMemo(() => {
    const sIds = new Set<string>();
    if (filterConfig) {
      for (const s of filterConfig.sections) {
        for (const f of s.filters) sIds.add(f.columnId);
      }
    }
    const cols = (staticColumns ?? []) as Array<Record<string, any>>;
    const extra = cols
      .filter((c) => c.id && !sIds.has(c.id))
      .map((c) => {
        const id = c.id as string;
        return {
          columnId: id,
          label: (c.label ?? c.header ?? id) as string,
          filterType: inferFilterType(id),
          queryParam: id,
        };
      });
    const sections = [...(filterConfig?.sections ?? [])];
    if (extra.length > 0) {
      sections.push({ title: 'More Filters', defaultOpen: false, filters: extra });
    }
    return {
      allFilterConfig: sections.length > 0 ? { sections } : undefined,
      staticFilterIds: sIds,
    };
  }, [filterConfig, staticColumns]);

  // Filter visible sidebar filters based on saved visibility + apply saved layout
  // Static filters: visible by default (hidden only if explicitly false)
  // Auto-generated: hidden by default (visible only if explicitly true)
  const filteredFilterConfig = useMemo(() => {
    if (!enabled || !allFilterConfig) return filterConfig;
    const vis = config.filterVisibility;
    const layout = config.filterLayout;

    // Build a flat map of all available filters (columnId → filter def)
    const filterMap = new Map<string, any>();
    for (const s of allFilterConfig.sections) {
      for (const f of s.filters) filterMap.set(f.columnId, f);
    }

    // Determine visibility for each filter
    const isVisible = (columnId: string) => {
      if (!vis) return staticFilterIds.has(columnId); // no prefs → static only
      if (staticFilterIds.has(columnId)) return vis[columnId] !== false;
      return vis[columnId] === true;
    };

    // If saved layout exists, use it to build sections in custom order
    if (layout && layout.length > 0) {
      const usedIds = new Set<string>();
      const sections = layout
        .map((ls) => {
          const filters = ls.filterIds
            .filter((id) => {
              const f = filterMap.get(id);
              return f && isVisible(id);
            })
            .map((id) => {
              usedIds.add(id);
              return filterMap.get(id)!;
            });
          // Preserve defaultOpen from original section if title matches
          const origSection = allFilterConfig.sections.find((s) => s.title === ls.title);
          return { title: ls.title, defaultOpen: origSection?.defaultOpen ?? false, filters };
        })
        .filter((s) => s.filters.length > 0);

      // Append any visible filters not covered by layout (e.g. newly added filters)
      const orphanFilters: any[] = [];
      for (const [id, f] of filterMap) {
        if (!usedIds.has(id) && isVisible(id)) orphanFilters.push(f);
      }
      if (orphanFilters.length > 0) {
        sections.push({ title: 'More Filters', defaultOpen: false, filters: orphanFilters });
      }

      return { sections };
    }

    // No layout saved — fall back to visibility-only filtering
    if (!vis) return filterConfig;
    return {
      sections: allFilterConfig.sections
        .map((section) => ({
          ...section,
          filters: section.filters.filter((f) => isVisible(f.columnId)),
        }))
        .filter((s) => s.filters.length > 0),
    };
  }, [enabled, allFilterConfig, filterConfig, staticFilterIds, config.filterVisibility, config.filterLayout]);

  // Unmask handler: calls API, caches result locally
  const handleUnmask = useCallback(
    async (recordId: string, columnId: string) => {
      try {
        const val = await unmask(recordId, columnId);
        if (val) {
          setUnmaskedValues(prev => ({ ...prev, [`${recordId}-${columnId}`]: val }));
        }
        return val;
      } catch {
        return null;
      }
    },
    [unmask],
  );

  // Apply masking to data based on rules + _maskingMeta from backend
  const maskedData = useMemo(() => {
    if (!enabled || !data || !Array.isArray(data) || rules.length === 0) {
      return data;
    }

    try {
      return (data as Record<string, any>[]).map((record) => {
        const meta = record._maskingMeta as
          | Record<string, { masked: boolean; canUnmask: boolean }>
          | undefined;
        const overrides: Record<string, any> = {};
        let hasOverrides = false;

        for (const rule of rules) {
          const colId = rule.columnId;
          const value = record[colId];
          if (value == null) continue;

          // Skip non-string values (e.g., React elements)
          if (typeof value !== 'string') continue;

          const recordId = String(record.id ?? '');
          const cacheKey = `${recordId}-${colId}`;

          // User already clicked unmask — show real value
          if (unmaskedValues[cacheKey]) {
            overrides[colId] = unmaskedValues[cacheKey];
            hasOverrides = true;
            continue;
          }

          // Backend already masked this column (has _maskingMeta entry)
          const metaEntry = meta?.[colId];
          if (metaEntry?.masked) {
            if (metaEntry.canUnmask) {
              overrides[colId] = createElement(
                'span',
                { className: 'inline-flex items-center gap-1' },
                String(value),
                createElement(UnmaskButton, {
                  key: `unmask-${cacheKey}`,
                  tableKey: tableKey!,
                  columnId: colId,
                  recordId,
                  onUnmask: handleUnmask,
                }),
              );
              hasOverrides = true;
            }
            // else: already masked, no unmask button — keep value as-is
            continue;
          }

          // Backend did NOT mask this column but rules say it should be masked
          // (e.g., contacts' email/phone are nested, backend couldn't reach them)
          if (value !== '\u2014' && value.length > 0) {
            const maskedStr = maskDisplayValue(value, rule.maskType);
            if (rule.canUnmask) {
              overrides[colId] = createElement(
                'span',
                { className: 'inline-flex items-center gap-1' },
                maskedStr,
                createElement(UnmaskButton, {
                  key: `unmask-${cacheKey}`,
                  tableKey: tableKey!,
                  columnId: colId,
                  recordId,
                  onUnmask: handleUnmask,
                }),
              );
            } else {
              overrides[colId] = maskedStr;
            }
            hasOverrides = true;
          }
        }

        if (!hasOverrides) return record;

        const { _maskingMeta, ...cleanRecord } = record;
        return { ...cleanRecord, ...overrides };
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[TableFull] Masking error for "${tableKey}":`, err);
      }
      return data;
    }
  }, [enabled, data, rules, tableKey, unmaskedValues, handleUnmask]);

  // Export handler — uses masked data + visible columns
  const handleExport = useCallback(
    (format: ExportFormat) => {
      const rows = rest.selectedIds?.size
        ? (maskedData as any[]).filter((r: any) => rest.selectedIds!.has(r.id))
        : (maskedData as any[]);
      exportData(format, {
        data: rows,
        columns: (effectiveColumns as any[]).map((c: any) => ({ id: c.id, label: c.label ?? c.id })),
        fileName: tableKey ?? 'export',
      });
    },
    [maskedData, effectiveColumns, tableKey, rest.selectedIds],
  );

  const exportButton = enabled ? (
    <ExportDropdown onExport={handleExport} />
  ) : null;

  const settingsButton = enabled ? (
    <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)}>
      <Icon name="settings" size={16} />
    </Button>
  ) : null;

  const combinedHeaderActions = (exportButton || settingsButton || headerActions) ? (
    <>
      {exportButton}
      {settingsButton}
      {headerActions}
    </>
  ) : undefined;

  // Fingerprint of visible columns — forces AICTableFull to re-mount when columns change
  const colFingerprint = useMemo(
    () => (effectiveColumns as any[])?.map((c: any) => `${c.id}:${c.label ?? ''}`).join('|') ?? '',
    [effectiveColumns],
  );

  // Key changes when ANY config value changes, forcing AICTableFull to re-mount
  // (AICTableFull reads density/viewMode/columns on mount only — uncontrolled)
  const configKey = useMemo(
    () => enabled
      ? `${tableKey}-${config.density ?? 'c'}-${isMobile ? 'card' : config.defaultViewMode ?? 't'}-${showActions}-${colFingerprint}`
      : `static-${isMobile ? 'card' : 'desk'}`,
    [enabled, tableKey, config.density, config.defaultViewMode, showActions, colFingerprint, isMobile],
  );

  const wrapperClass = `table-full-${scopeId}`;

  return (
    <div className={`${wrapperClass} crm-table-full h-full ${isMobile ? 'crm-mobile' : ''}`}>
      {/* Scoped CSS to hide actions column when disabled */}
      {!showActions && (
        <style>{`.${wrapperClass} th:last-child, .${wrapperClass} td:last-child { display: none !important; }`}</style>
      )}
      <AICTableFull
        key={configKey}
        {...rest}
        filterConfig={filteredFilterConfig}
        data={maskedData}
        columns={effectiveColumns}
        defaultDensity={(enabled ? config.density : rest.defaultDensity) as AICTableFullProps['defaultDensity']}
        defaultViewMode={(isMobile ? 'card' : (enabled ? config.defaultViewMode : undefined) ?? rest.defaultViewMode) as AICTableFullProps['defaultViewMode']}
        headerActions={combinedHeaderActions}
        onRowEdit={showActions ? onRowEdit : undefined}
        onRowDelete={showActions ? onRowDelete : undefined}
        onRowCopy={showActions ? onRowCopy : undefined}
        onRowArchive={showActions ? onRowArchive : undefined}
        kanbanCategoryOptions={kanbanCategoryOptions}
        defaultCalendarSettings={defaultCalendarSettings}
      />
      {enabled && (
        <TableConfigDrawer
          tableKey={tableKey!}
          filterConfig={allFilterConfig}
          defaultFilterIds={staticFilterIds}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
