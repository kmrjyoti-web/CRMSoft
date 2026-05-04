import type { TableFilterConfig } from '@/components/ui';

export const ORGANIZATION_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: 'Status',
      defaultOpen: true,
      filters: [
        { columnId: 'isActive', label: 'Active', filterType: 'boolean', queryParam: 'isActive' },
      ],
    },
    {
      title: 'Lookup Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'industry', label: 'Industry', filterType: 'master', queryParam: 'industry', options: [] },
      ],
    },
    {
      title: 'Text Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'name', label: 'Name', filterType: 'text', queryParam: 'search' },
        { columnId: 'city', label: 'City', filterType: 'text', queryParam: 'city' },
        { columnId: 'phone', label: 'Phone', filterType: 'text', queryParam: 'phone' },
        { columnId: 'website', label: 'Website', filterType: 'text', queryParam: 'website' },
      ],
    },
    {
      title: 'Date Fields',
      defaultOpen: false,
      filters: [
        { columnId: 'createdAt', label: 'Created Date', filterType: 'date', queryParam: 'createdAt' },
      ],
    },
  ],
};

/** Lookup mappings for useDynamicFilterConfig */
export const ORGANIZATION_LOOKUP_MAPPINGS: Record<string, string> = {
  industry: 'INDUSTRY_TYPE',
};
