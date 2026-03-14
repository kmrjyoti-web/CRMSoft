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

interface SettingsGroup {
  title: string;
  items: SettingsMenuItem[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Company",
    items: [
      {
        label: "Company Profile",
        description: "Business info, address, GST, financial year, inventory settings",
        icon: "building-2",
        path: "/settings/company",
      },
      {
        label: "Operating Locations",
        description: "Countries, states, cities and pincodes — drives GST inter/intra-state",
        icon: "map-pin",
        path: "/settings/locations",
      },
    ],
  },
  {
    title: "General",
    items: [
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
        label: "Auto Numbering",
        description: "Configure auto-generated numbers for leads, invoices, quotations",
        icon: "hash",
        path: "/settings/auto-numbering",
      },
    ],
  },
  {
    title: "Integrations",
    items: [
      {
        label: "Google",
        description: "Connect Google services — Gmail, Calendar, Docs, Meet, Contacts",
        icon: "globe",
        path: "/settings/google",
      },
      {
        label: "WhatsApp",
        description: "Configure WhatsApp Business API account",
        icon: "message-circle",
        path: "/settings/whatsapp",
      },
      {
        label: "Email",
        description: "Manage email accounts and SMTP settings",
        icon: "mail",
        path: "/settings/email",
      },
      {
        label: "Notion",
        description: "Sync dev sessions to Notion database",
        icon: "bookmark",
        path: "/settings/notion",
      },
      {
        label: "API Credentials",
        description: "Manage API keys and credentials for third-party services",
        icon: "zap",
        path: "/settings/integrations",
      },
      {
        label: "AI Models",
        description: "Configure AI providers, default models, and monitor usage",
        icon: "cpu",
        path: "/settings/ai",
      },
      {
        label: "Plugin Store",
        description: "Browse, install, and manage third-party plugins",
        icon: "package",
        path: "/plugins/catalog",
      },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        label: "Subscription",
        description: "View your current plan, usage limits, and billing history",
        icon: "crown",
        path: "/settings/subscription",
      },
      {
        label: "Wallet",
        description: "Token wallet balance, recharge, and transaction history",
        icon: "wallet",
        path: "/settings/wallet",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Data Masking",
        description: "Configure field-level masking rules per role",
        icon: "eye-off",
        path: "/settings/data-masking",
      },
      {
        label: "Scheduled Jobs",
        description: "Monitor and configure cron job schedules",
        icon: "clock",
        path: "/settings/cron-jobs",
      },
      {
        label: "Workflows",
        description: "Configure lead pipelines, stages and transitions",
        icon: "activity",
        path: "/workflows",
      },
    ],
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

      <div className="space-y-8">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
