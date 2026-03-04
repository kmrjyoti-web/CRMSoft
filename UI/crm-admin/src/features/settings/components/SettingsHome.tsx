"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui";

import type { IconName } from "@/components/ui";

// ── Settings Menu Items ─────────────────────────────────

interface SettingsMenuItem {
  label: string;
  description: string;
  icon: IconName;
  path: string;
}

const SETTINGS_ITEMS: SettingsMenuItem[] = [
  {
    label: "Users",
    description: "Manage user accounts, roles and access",
    icon: "users",
    path: "/settings/users",
  },
  {
    label: "Roles",
    description: "Define roles and assign permissions",
    icon: "shield",
    path: "/settings/roles",
  },
  {
    label: "Permissions",
    description: "View and manage permission matrix",
    icon: "lock",
    path: "/settings/permissions",
  },
  {
    label: "Lookups",
    description: "Manage lookup categories and values",
    icon: "list",
    path: "/settings/lookups",
  },
  {
    label: "Menus",
    description: "Configure sidebar navigation menus",
    icon: "menu",
    path: "/settings/menus",
  },
  {
    label: "Data Masking",
    description: "Configure field-level masking rules per role",
    icon: "eye-off",
    path: "/settings/data-masking",
  },
  {
    label: "Notion",
    description: "Sync dev sessions to Notion database",
    icon: "book-open",
    path: "/settings/notion",
  },
];

// ── Component ───────────────────────────────────────────

export function SettingsHome() {
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your application configuration
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_ITEMS.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => router.push(item.path)}
            className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-lg text-left
                       hover:border-blue-300 hover:shadow-md transition-all duration-150 cursor-pointer group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center
                            group-hover:bg-blue-100 transition-colors">
              <Icon name={item.icon} size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
