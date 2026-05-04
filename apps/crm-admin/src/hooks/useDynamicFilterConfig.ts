'use client';

import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { lookupService } from '@/services/lookup.service';
import type { TableFilterConfig } from '@/components/ui';

/**
 * Maps columnId → masterCode for filters whose options
 * should be populated from the Lookup API.
 *
 * Example: { designation: 'DESIGNATION', department: 'DEPARTMENT' }
 */
type LookupMapping = Record<string, string>;

/**
 * Enriches a static TableFilterConfig with live lookup options.
 *
 * For each entry in `lookupMappings`, it:
 *  1. Fetches the lookup values for that masterCode (reuses 30 min cache)
 *  2. Converts them to `{ value, label }` option arrays
 *  3. Merges them into the matching filter definition (sets filterType to 'master')
 *
 * Falls back gracefully: if lookup fetch fails, the filter stays as-is.
 */
export function useDynamicFilterConfig(
  baseConfig: TableFilterConfig,
  lookupMappings: LookupMapping = {},
): TableFilterConfig {
  const masterCodes = useMemo(
    () => [...new Set(Object.values(lookupMappings))],
    [lookupMappings],
  );

  const queries = useQueries({
    queries: masterCodes.map((code) => ({
      queryKey: ['lookup', code],
      queryFn: () => lookupService.getValues(code),
      staleTime: 30 * 60 * 1000,
      enabled: !!code,
    })),
  });

  // Build masterCode → options map
  const optionsMap = useMemo(() => {
    const map: Record<string, { value: string; label: string }[]> = {};
    masterCodes.forEach((code, idx) => {
      const data = queries[idx].data;
      if (data) {
        map[code] = data.map((v) => ({ value: v.value, label: v.label }));
      }
    });
    return map;
  }, [masterCodes, queries]);

  // Return enriched config
  return useMemo(
    () => ({
      sections: baseConfig.sections.map((section) => ({
        ...section,
        filters: section.filters.map((filter) => {
          const code = lookupMappings[filter.columnId];
          if (code && optionsMap[code]) {
            return {
              ...filter,
              filterType: 'master' as const,
              options: optionsMap[code],
            };
          }
          return filter;
        }),
      })),
    }),
    [baseConfig, lookupMappings, optionsMap],
  );
}
