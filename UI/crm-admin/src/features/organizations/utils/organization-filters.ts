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
      title: 'Text Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'city', label: 'City', filterType: 'text', queryParam: 'city' },
        { columnId: 'industry', label: 'Industry', filterType: 'text', queryParam: 'industry' },
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
