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
        label: "Inventory Overview",
        description: "Stock value, low stock alerts, expiring items",
        icon: "bar-chart-3",
        path: "/inventory",
      },
    ],
  },
  {
    key: "config",
    label: "Config",
    icon: "settings",
    items: [
      {
        label: "Item",
        description: "Products, SKUs, inventory items master",
        icon: "package",
        path: "/products/products",
      },
      {
        label: "Store",
        description: "Warehouses, branches, kitchens, locations",
        icon: "map-pin",
        path: "/inventory/locations",
      },
      {
        label: "Company",
        description: "Supplier & vendor organizations",
        icon: "building",
        path: "/organizations",
      },
      {
        label: "Multi Group",
        description: "Product categories & classification",
        icon: "tags",
        path: "/products/categories",
      },
      {
        label: "Unit",
        description: "Units of measurement & conversions",
        icon: "hash",
        path: "/settings/units",
      },
      {
        label: "Manufacturer",
        description: "Product manufacturers & OEMs",
        icon: "factory",
        path: "/products/manufacturers",
      },
      {
        label: "Brand",
        description: "Product brands & trademarks",
        icon: "award",
        path: "/inventory/companies",
      },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    icon: "wrench",
    items: [
      {
        label: "Bulk Import",
        description: "Import serial numbers & stock from CSV",
        icon: "upload",
        path: "/inventory/serials/bulk-import",
      },
      {
        label: "Stock Adjustment",
        description: "Manual stock corrections and write-offs",
        icon: "sliders",
        path: "/inventory/adjustments",
      },
      {
        label: "Inventory Labels",
        description: "Industry-specific field labels & custom fields",
        icon: "tag",
        path: "/settings/inventory-labels",
      },
    ],
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: "bar-chart-3",
    items: [
      {
        label: "Stock Ledger",
        description: "Item-wise IN/OUT with running balance",
        icon: "book-open",
        path: "/inventory/reports/ledger",
      },
      {
        label: "Stock Valuation",
        description: "Total inventory value in ₹ (FIFO/Average)",
        icon: "indian-rupee",
        path: "/inventory/reports/valuation",
      },
      {
        label: "Expiry Report",
        description: "Items expiring in 30/60/90 days",
        icon: "clock",
        path: "/inventory/reports/expiry",
      },
      {
        label: "Serial Tracking",
        description: "Full lifecycle trace of a serial number",
        icon: "scan-line",
        path: "/inventory/reports/serial-tracking",
      },
    ],
  },
];

export default function InventoryMasterPage() {
  return <MasterTabLayout title="Inventory Master" icon="package" tabs={tabs} />;
}
