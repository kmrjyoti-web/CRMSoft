import type { TableFilterConfig } from '@/components/ui';

export const LEAD_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: 'Status & Priority',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master',
          queryParam: 'status',
          options: [
            { value: 'NEW', label: 'New' },
            { value: 'VERIFIED', label: 'Verified' },
            { value: 'ALLOCATED', label: 'Allocated' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'DEMO_SCHEDULED', label: 'Demo Scheduled' },
            { value: 'QUOTATION_SENT', label: 'Quotation Sent' },
            { value: 'NEGOTIATION', label: 'Negotiation' },
            { value: 'WON', label: 'Won' },
            { value: 'LOST', label: 'Lost' },
            { value: 'ON_HOLD', label: 'On Hold' },
          ],
        },
        {
          columnId: 'priority',
          label: 'Priority',
          filterType: 'master',
          queryParam: 'priority',
          options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ],
        },
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
