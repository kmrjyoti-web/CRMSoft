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
      title: 'Lookup Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'designation', label: 'Designation', filterType: 'master', queryParam: 'designation', options: [] },
        { columnId: 'department', label: 'Department', filterType: 'master', queryParam: 'department', options: [] },
      ],
    },
    {
      title: 'Text Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'name', label: 'Name', filterType: 'text', queryParam: 'search' },
        { columnId: 'email', label: 'Email', filterType: 'text', queryParam: 'email' },
        { columnId: 'phone', label: 'Phone', filterType: 'text', queryParam: 'phone' },
        { columnId: 'organization', label: 'Organization', filterType: 'text', queryParam: 'organization' },
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
export const CONTACT_LOOKUP_MAPPINGS: Record<string, string> = {
  designation: 'DESIGNATION',
  department: 'DEPARTMENT',
};
