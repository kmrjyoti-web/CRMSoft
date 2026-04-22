"use client";

import { MasterTabLayout } from "@/features/master/components/MasterTabLayout";
import type { MasterTab } from "@/features/master/components/MasterTabLayout";

const tabs: MasterTab[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    items: [
      {
        label: "Settings Overview",
        description: "Organization, users, roles, lookups",
        icon: "settings",
        path: "/settings",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Locations",
        description: "Business locations, branches, offices",
        icon: "map-pin",
        path: "/settings/locations",
      },
      {
        label: "Departments",
        description: "Organizational departments & teams",
        icon: "building-2",
        path: "/settings/departments",
      },
      {
        label: "Designations",
        description: "Job titles and designations",
        icon: "briefcase",
        path: "/settings/designations",
      },
      {
        label: "Custom Fields",
        description: "Add extra fields to any entity",
        icon: "settings-2",
        path: "/settings/custom-fields",
      },
      {
        label: "Business Types",
        description: "Industry-specific CRM configurations",
        icon: "briefcase",
        path: "/settings/business-types",
      },
      {
        label: "Lookups",
        description: "Dropdown values, status lists, categories",
        icon: "list",
        path: "/settings/lookups",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Import Profiles",
        description: "Saved CSV/Excel import configurations",
        icon: "upload",
        path: "/import/profiles",
      },
      {
        label: "Data Masking",
        description: "RBAC field masking policies",
        icon: "eye-off",
        path: "/settings/data-masking",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Audit Logs",
        description: "Who changed what and when",
        icon: "scroll-text",
        path: "/audit-logs",
      },
      {
        label: "Error Logs",
        description: "System errors and alerts",
        icon: "alert-triangle",
        path: "/settings/error-logs",
      },
    ],
  },
];

export default function OtherMasterPage() {
  return <MasterTabLayout title="Other Master" icon="folder" tabs={tabs} />;
}
