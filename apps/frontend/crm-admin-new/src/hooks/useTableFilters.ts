'use client';

import { useState, useMemo, useCallback } from 'react';

import type {
  TableFilterConfig,
  FilterValues,
  FilterValue,
} from '@/components/ui';

/**
 * Converts dynamic FilterValues into flat API query params.
 *
 * Mapping rules:
 * - text   → { [queryParam]: value }
 * - number → { [queryParam + 'Min']: min, [queryParam + 'Max']: max }
 * - date   → { [queryParam + 'From']: from, [queryParam + 'To']: to }
 * - master → { [queryParam]: selected (joined by comma) }
 * - boolean→ { [queryParam]: value }
 */
function toQueryParams(
  values: FilterValues,
  config: TableFilterConfig,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const allFilters = config.sections.flatMap((s) => s.filters);

  for (const [columnId, filterValue] of Object.entries(values)) {
    if (!filterValue) continue;
    const def = allFilters.find((f) => f.columnId === columnId);
    if (!def) continue;

    switch (filterValue.type) {
      case 'text':
        if (filterValue.value) params[def.queryParam] = filterValue.value;
        break;
      case 'number':
        if (filterValue.min !== undefined)
          params[`${def.queryParam}Min`] = filterValue.min;
        if (filterValue.max !== undefined)
          params[`${def.queryParam}Max`] = filterValue.max;
        break;
      case 'date':
        if (filterValue.from)
          params[`${def.queryParam}From`] = filterValue.from;
        if (filterValue.to) params[`${def.queryParam}To`] = filterValue.to;
        break;
      case 'master':
        if (filterValue.selected.length > 0)
          params[def.queryParam] = filterValue.selected.join(',');
        break;
      case 'boolean':
        params[def.queryParam] = filterValue.value;
        break;
    }
  }

  return params;
}

export function useTableFilters(filterConfig: TableFilterConfig) {
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  const filterParams = useMemo(
    () => toQueryParams(activeFilters, filterConfig),
    [activeFilters, filterConfig],
  );

  const handleFilterChange = useCallback((values: FilterValues) => {
    setActiveFilters(values);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  return {
    activeFilters,
    filterParams,
    handleFilterChange,
    clearFilters,
  };
}
