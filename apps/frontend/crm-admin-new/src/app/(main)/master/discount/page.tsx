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
        label: "Discount Overview",
        description: "Active discount schemes and their impact",
        icon: "bar-chart-3",
        path: "/discount-master",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Agency General Discount",
        description: "Flat % discount for agents and distributors",
        icon: "tag",
        path: "/discount-master/agency",
      },
      {
        label: "Item wise Discount",
        description: "Per-item discount rules and slabs",
        icon: "package",
        path: "/discount-master/item",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Sales Promotions",
        description: "Seasonal offers, bundle deals, combo pricing",
        icon: "gift",
        path: "/promotions",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Discount Analysis",
        description: "Discount given vs margin impact",
        icon: "trending-down",
        path: "/reports?category=DISCOUNTS",
      },
    ],
  },
];

export default function DiscountMasterPage() {
  return <MasterTabLayout title="Discount Master" icon="percent" tabs={tabs} />;
}
