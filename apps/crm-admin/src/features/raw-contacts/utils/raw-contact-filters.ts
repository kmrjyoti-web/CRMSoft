import type { TableFilterConfig } from '@/components/ui';

export const RAW_CONTACT_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: 'Status & Source',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master',
          queryParam: 'status',
          options: [
            { value: 'RAW', label: 'Raw' },
            { value: 'VERIFIED', label: 'Verified' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'DUPLICATE', label: 'Duplicate' },
          ],
        },
        {
          columnId: 'source',
          label: 'Source',
          filterType: 'master',
          queryParam: 'source',
          options: [
            { value: 'MANUAL', label: 'Manual' },
            { value: 'BULK_IMPORT', label: 'Bulk Import' },
            { value: 'WEB_FORM', label: 'Web Form' },
            { value: 'REFERRAL', label: 'Referral' },
            { value: 'API', label: 'API' },
          ],
        },
      ],
    },
    {
      title: 'Text Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'firstName', label: 'First Name', filterType: 'text', queryParam: 'firstName' },
        { columnId: 'lastName', label: 'Last Name', filterType: 'text', queryParam: 'lastName' },
        { columnId: 'companyName', label: 'Company', filterType: 'text', queryParam: 'companyName' },
        { columnId: 'email', label: 'Email', filterType: 'text', queryParam: 'email' },
        { columnId: 'phone', label: 'Phone', filterType: 'text', queryParam: 'phone' },
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
