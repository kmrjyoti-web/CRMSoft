import { useQuery } from '@tanstack/react-query';
import { smartSearchService } from './smart-search.service';
import type { EntityType, SearchFilter } from './types';

export function useSmartSearch(
  entityType: EntityType,
  filters: SearchFilter[],
  currentParam: string,
  currentValue: string,
  enabled = true,
) {
  // Build final filters including the live input
  const allFilters: SearchFilter[] = [
    ...filters,
    ...(currentValue.trim()
      ? [{ parameter: currentParam, value: currentValue.trim(), pattern: parsePattern(currentValue.trim()) }]
      : []),
  ];

  const hasQuery = allFilters.some((f) => f.value.length > 0);

  return useQuery({
    queryKey: ['smart-search', entityType, allFilters],
    queryFn: () => smartSearchService.search(entityType, allFilters),
    enabled: enabled && hasQuery,
    staleTime: 3000,
    select: (raw: any) => {
      // CONTACT/ORG: service returns { results: [...], total, limit, offset }
      // PRODUCT/LEDGER: generic endpoint returns ApiResponse { data: { results, total } }
      if (Array.isArray(raw?.results)) return raw;
      if (Array.isArray(raw?.data?.results)) return raw.data;
      return raw;
    },
  });
}

export function useParameterConfig(entityType: EntityType, allowed?: string[]) {
  const { data } = useQuery({
    queryKey: ['smart-search-params', entityType],
    queryFn: () => smartSearchService.getParameters(entityType),
    staleTime: 60000,
  });

  const params: any[] = (data as any)?.data ?? (data as any) ?? getFallbackParams(entityType);
  const paramArray = Array.isArray(params) ? params : getFallbackParams(entityType);
  if (!allowed?.length) return paramArray;
  return paramArray.filter((p: any) => allowed.includes(p.code));
}

export function parsePattern(value: string): 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT' {
  if (value.startsWith('%')) return 'STARTS_WITH';
  if (value.endsWith('%')) return 'ENDS_WITH';
  if (value.startsWith('=')) return 'EXACT';
  return 'CONTAINS';
}

function getFallbackParams(entityType: EntityType) {
  const map: Record<string, any[]> = {
    CONTACT:      [{ code: 'NM', label: 'Name', isDefault: true }, { code: 'EI', label: 'Email ID' }, { code: 'MN', label: 'Mobile No' }, { code: 'GS', label: 'GSTIN' }, { code: 'CT', label: 'City' }, { code: 'PN', label: 'PAN No' }, { code: 'CD', label: 'Code' }, { code: 'ST', label: 'State' }],
    ORGANIZATION: [{ code: 'NM', label: 'Name', isDefault: true }, { code: 'EI', label: 'Email ID' }, { code: 'MN', label: 'Mobile No' }, { code: 'GS', label: 'GSTIN' }, { code: 'CT', label: 'City' }, { code: 'CD', label: 'Code' }, { code: 'WB', label: 'Website' }],
    PRODUCT:      [{ code: 'NM', label: 'Name', isDefault: true }, { code: 'CD', label: 'Code' }, { code: 'HSN', label: 'HSN/SAC' }, { code: 'BR', label: 'Brand' }, { code: 'CT', label: 'Category' }],
    LEDGER:       [{ code: 'NM', label: 'Name', isDefault: true }, { code: 'CD', label: 'Code' }, { code: 'GR', label: 'Group' }, { code: 'GS', label: 'GSTIN' }, { code: 'STN', label: 'Station' }],
    ROW_CONTACT:  [{ code: 'NM', label: 'Name', isDefault: true }, { code: 'EI', label: 'Email ID' }, { code: 'MN', label: 'Mobile No' }],
    INVOICE:      [{ code: 'NO', label: 'Invoice No', isDefault: true }, { code: 'CN', label: 'Customer' }, { code: 'ST', label: 'Status' }],
  };
  return map[entityType] || [{ code: 'NM', label: 'Name', isDefault: true }];
}
