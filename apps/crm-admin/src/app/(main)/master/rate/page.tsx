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
        label: "Rate Overview",
        description: "Active price lists, recent price changes",
        icon: "bar-chart-3",
        path: "/rate-master",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Price List",
        description: "Manage customer & channel price lists",
        icon: "list",
        path: "/rate-master/price-list",
      },
      {
        label: "Price Groups",
        description: "Group customers by pricing tier",
        icon: "users",
        path: "/rate-master/price-groups",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Bulk Price Update",
        description: "Update prices for multiple items at once",
        icon: "upload",
        path: "/rate-master/bulk-update",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Price Comparison",
        description: "Compare item prices across different lists",
        icon: "git-compare",
        path: "/rate-master/reports/compare",
      },
    ],
  },
];

export default function RateMasterPage() {
  return <MasterTabLayout title="Rate Master" icon="tag" tabs={tabs} />;
}
