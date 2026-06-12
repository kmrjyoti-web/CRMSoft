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
        label: "Accounts Overview",
        description: "Receivables, payables, cash position at a glance",
        icon: "bar-chart-3",
        path: "/accounts",
      },
      {
        label: "GST Dashboard",
        description: "GST liability, ITC, filing status",
        icon: "file-badge",
        path: "/accounts/gst",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Ledger",
        description: "Create & manage ledger accounts (Marg-style)",
        icon: "book",
        path: "/accounts/ledger",
      },
      {
        label: "Group",
        description: "Account group hierarchy (Capital, Assets, Liabilities…)",
        icon: "git-branch",
        path: "/accounts/groups",
      },
      {
        label: "Sale Master",
        description: "GST sale tax types — IGST/CGST/SGST rates",
        icon: "trending-up",
        path: "/accounts/sale",
      },
      {
        label: "Purchase Master",
        description: "GST purchase tax types — Input tax ledger links",
        icon: "trending-down",
        path: "/accounts/purchase",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Ledger Mapping",
        description: "Map contacts & organizations to accounting ledgers",
        icon: "link",
        path: "/accounts/ledger-mappings",
      },
      {
        label: "Bulk Ledger Import",
        description: "Import multiple ledgers from CSV / Excel",
        icon: "upload",
        path: "/accounts/bulk-import",
      },
      {
        label: "Opening Balance",
        description: "Enter opening balances for ledger accounts",
        icon: "scale",
        path: "/accounts/opening-balance",
      },
      {
        label: "Journal Entry",
        description: "Manual double-entry book-keeping",
        icon: "book-open",
        path: "/accounts/journal-entries",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Trial Balance",
        description: "Debit vs Credit totals for all ledgers",
        icon: "scale",
        path: "/accounts/reports/trial-balance",
      },
      {
        label: "Ledger Statement",
        description: "All transactions for a specific ledger + date range",
        icon: "file-text",
        path: "/accounts/reports/ledger-statement",
      },
      {
        label: "Payable Aging",
        description: "Outstanding payables grouped by age (30/60/90+ days)",
        icon: "clock",
        path: "/accounts/reports/payable-aging",
      },
      {
        label: "Receivable Aging",
        description: "Outstanding receivables grouped by age",
        icon: "clock",
        path: "/accounts/reports/receivable-aging",
      },
      {
        label: "Day Book",
        description: "All transactions entered for a specific date",
        icon: "calendar",
        path: "/accounts/reports/day-book",
      },
    ],
  },
];

export default function AccountsMasterPage() {
  return <MasterTabLayout title="Accounts Master" icon="coins" tabs={tabs} />;
}
