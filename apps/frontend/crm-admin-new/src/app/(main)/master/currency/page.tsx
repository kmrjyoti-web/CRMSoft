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
        label: "Currency Overview",
        description: "Base currency, exchange rates, forex exposure",
        icon: "bar-chart-3",
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
        label: "Currency Settings",
        description: "Base currency and decimal precision",
        icon: "banknote",
        path: "/settings",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Exchange Rates",
        description: "Update USD, EUR, AED and other forex rates",
        icon: "arrow-left-right",
        path: "/settings",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Forex Gain/Loss",
        description: "Currency conversion gains and losses",
        icon: "trending-up",
        path: "/accounts/reports",
      },
    ],
  },
];

export default function CurrencyMasterPage() {
  return <MasterTabLayout title="Currency" icon="banknote" tabs={tabs} />;
}
