// Filter configs for WhatsApp list pages

export const TEMPLATE_FILTER_CONFIG = {
  sections: [
    {
      title: 'Template Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'APPROVED', label: 'Approved' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'PAUSED', label: 'Paused' },
          ],
        },
        {
          columnId: 'category',
          label: 'Category',
          filterType: 'master' as const,
          queryParam: 'category',
          options: [
            { value: 'UTILITY', label: 'Utility' },
            { value: 'AUTHENTICATION', label: 'Authentication' },
            { value: 'MARKETING', label: 'Marketing' },
          ],
        },
      ],
    },
  ],
};

export const BROADCAST_FILTER_CONFIG = {
  sections: [
    {
      title: 'Broadcast Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'SENDING', label: 'Sending' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'FAILED', label: 'Failed' },
          ],
        },
      ],
    },
  ],
};

export const CHATBOT_FILTER_CONFIG = {
  sections: [
    {
      title: 'Chatbot Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'DRAFT', label: 'Draft' },
          ],
        },
      ],
    },
  ],
};
