import type { TableFilterConfig } from '@/components/ui';

export const CONTACT_FILTER_CONFIG: TableFilterConfig = {
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
        { columnId: 'designation', label: 'Designation', filterType: 'text', queryParam: 'designation' },
        { columnId: 'department', label: 'Department', filterType: 'text', queryParam: 'department' },
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
