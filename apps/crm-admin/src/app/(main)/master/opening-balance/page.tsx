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
        label: "Opening Balance Status",
        description: "Which ledgers have opening balances set",
        icon: "bar-chart-3",
        path: "/accounts",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Ledger Opening Balance",
        description: "Set Dr/Cr opening balance for ledger accounts",
        icon: "scale",
        path: "/accounts/opening-balance",
      },
      {
        label: "Stock Opening Balance",
        description: "Enter opening stock quantities & values",
        icon: "package",
        path: "/inventory/adjustments",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Bulk Opening Balance",
        description: "Import opening balances from CSV",
        icon: "upload",
        path: "/accounts/bulk-import",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Opening Balance Report",
        description: "Summary of all ledger opening balances",
        icon: "file-text",
        path: "/accounts/reports/trial-balance",
      },
    ],
  },
];

export default function OpeningBalanceMasterPage() {
  return <MasterTabLayout title="Opening Balance" icon="scale" tabs={tabs} />;
}
