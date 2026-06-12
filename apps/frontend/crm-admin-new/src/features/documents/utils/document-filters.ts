import type { TableFilterConfig } from '@/components/ui';

export const DOCUMENT_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: 'Category',
      defaultOpen: true,
      filters: [
        {
          columnId: 'category',
          label: 'Category',
          filterType: 'master',
          queryParam: 'category',
          options: [
            { label: 'General', value: 'GENERAL' },
            { label: 'Proposal', value: 'PROPOSAL' },
            { label: 'Contract', value: 'CONTRACT' },
            { label: 'Invoice', value: 'INVOICE' },
            { label: 'Quotation', value: 'QUOTATION' },
            { label: 'Report', value: 'REPORT' },
            { label: 'Presentation', value: 'PRESENTATION' },
            { label: 'Spreadsheet', value: 'SPREADSHEET' },
            { label: 'Image', value: 'IMAGE' },
            { label: 'Video', value: 'VIDEO' },
            { label: 'Audio', value: 'AUDIO' },
            { label: 'Other', value: 'OTHER' },
          ],
        },
      ],
    },
    {
      title: 'Storage',
      defaultOpen: true,
      filters: [
        {
          columnId: 'storageType',
          label: 'Storage Type',
          filterType: 'master',
          queryParam: 'storageType',
          options: [
            { label: 'Local', value: 'LOCAL' },
            { label: 'Cloud (S3)', value: 'S3' },
            { label: 'Cloud Link', value: 'CLOUD_LINK' },
          ],
        },
      ],
    },
    {
      title: 'Text Fields',
      defaultOpen: true,
      filters: [
        { columnId: 'name', label: 'File Name', filterType: 'text', queryParam: 'search' },
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
