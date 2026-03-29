import type { TableFilterConfig } from "@/components/ui";

export const WARRANTY_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "EXPIRED", label: "Expired" },
            { value: "CLAIMED", label: "Claimed" },
            { value: "VOIDED", label: "Voided" },
            { value: "EXTENDED", label: "Extended" },
          ],
          queryParam: "status",
        },
      ],
    },
    {
      title: "Search",
      defaultOpen: true,
      filters: [
        {
          columnId: "customerName",
          label: "Customer",
          filterType: "text",
          queryParam: "search",
        },
      ],
    },
  ],
};

export const CLAIM_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "OPEN", label: "Open" },
            { value: "ASSIGNED", label: "Assigned" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "CLOSED", label: "Closed" },
            { value: "REJECTED", label: "Rejected" },
          ],
          queryParam: "status",
        },
      ],
    },
  ],
};

export const WARRANTY_TEMPLATE_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Industry",
      defaultOpen: true,
      filters: [
        {
          columnId: "industryCode",
          label: "Industry",
          filterType: "master",
          options: [
            { value: "electronics", label: "Electronics" },
            { value: "software", label: "Software" },
            { value: "industrial", label: "Industrial" },
            { value: "medical", label: "Medical" },
            { value: "automotive", label: "Automotive" },
            { value: "fmcg", label: "FMCG" },
          ],
          queryParam: "industryCode",
        },
      ],
    },
  ],
};

export const AMC_PLAN_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Plan Tier",
      defaultOpen: true,
      filters: [
        {
          columnId: "planTier",
          label: "Plan Tier",
          filterType: "master",
          options: [
            { value: "BASIC", label: "Basic" },
            { value: "SILVER", label: "Silver" },
            { value: "GOLD", label: "Gold" },
            { value: "PLATINUM", label: "Platinum" },
            { value: "CUSTOM", label: "Custom" },
          ],
          queryParam: "planTier",
        },
      ],
    },
  ],
};

export const AMC_CONTRACT_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "DRAFT", label: "Draft" },
            { value: "ACTIVE", label: "Active" },
            { value: "EXPIRED", label: "Expired" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "RENEWED", label: "Renewed" },
          ],
          queryParam: "status",
        },
      ],
    },
  ],
};

export const AMC_SCHEDULE_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "MISSED", label: "Missed" },
            { value: "RESCHEDULED", label: "Rescheduled" },
            { value: "CANCELLED", label: "Cancelled" },
          ],
          queryParam: "status",
        },
      ],
    },
    {
      title: "Date",
      defaultOpen: false,
      filters: [
        {
          columnId: "scheduleDate",
          label: "Schedule Date",
          filterType: "date",
          queryParam: "scheduleDate",
        },
      ],
    },
  ],
};

export const SERVICE_VISIT_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Type",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ],
          queryParam: "status",
        },
        {
          columnId: "sourceType",
          label: "Source Type",
          filterType: "master",
          options: [
            { value: "WARRANTY_CLAIM", label: "Warranty Claim" },
            { value: "AMC_SCHEDULE", label: "AMC Schedule" },
            { value: "AMC_ON_DEMAND", label: "AMC On Demand" },
            { value: "PAID_SERVICE", label: "Paid Service" },
          ],
          queryParam: "sourceType",
        },
      ],
    },
  ],
};
