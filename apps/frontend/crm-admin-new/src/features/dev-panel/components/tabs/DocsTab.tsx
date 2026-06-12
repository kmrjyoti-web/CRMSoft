'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui';

// -- Products --
import { PackageListDevHelp } from '@/features/products/help/PackageListDevHelp';
import { ProductListDevHelp } from '@/features/products/help/ProductListDevHelp';

// -- CRM Entities --
import { ContactListDevHelp } from '@/features/contacts/help/ContactListDevHelp';
import { OrganizationListDevHelp } from '@/features/organizations/help/OrganizationListDevHelp';

// -- Sales Pipeline --
import { LeadListDevHelp } from '@/features/leads/help/LeadListDevHelp';
import { QuotationListDevHelp } from '@/features/quotations/help/QuotationListDevHelp';

// -- Activities --
import { ActivityListDevHelp } from '@/features/activities/help/ActivityListDevHelp';
import { TaskListDevHelp } from '@/features/tasks/help/TaskListDevHelp';

// -- Finance --
import { InvoiceListDevHelp } from '@/features/finance/help/InvoiceListDevHelp';
import { PaymentListDevHelp } from '@/features/finance/help/PaymentListDevHelp';

// -- Post-Sales --
import { PostSalesDevHelp } from '@/features/post-sales/help/PostSalesDevHelp';

// -- Communication --
import { CommunicationDevHelp } from '@/features/communication/help/CommunicationDevHelp';

// -- Settings --
import { SettingsDevHelp } from '@/features/settings/help/SettingsDevHelp';
import { WhatsAppConfigDevHelp } from '@/features/settings/help/WhatsAppConfigDevHelp';
import { EmailConfigDevHelp } from '@/features/settings/help/EmailConfigDevHelp';
import { CronConfigDevHelp } from '@/features/settings/help/CronConfigDevHelp';

// -- Workflows --
import { WorkflowDevHelp } from '@/features/workflows/help/WorkflowDevHelp';

// -- Dashboard --
import { DashboardDevHelp } from '@/features/dashboard/help/DashboardDevHelp';

// ── Navigation structure ────────────────────────────────────

interface DocEntry {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

interface DocGroup {
  title: string;
  entries: DocEntry[];
}

const DOC_GROUPS: DocGroup[] = [
  {
    title: 'CRM Entities',
    entries: [
      { id: 'contacts', label: 'Contacts', icon: 'users', component: ContactListDevHelp },
      { id: 'organizations', label: 'Organizations', icon: 'building', component: OrganizationListDevHelp },
    ],
  },
  {
    title: 'Sales Pipeline',
    entries: [
      { id: 'leads', label: 'Leads', icon: 'target', component: LeadListDevHelp },
      { id: 'quotations', label: 'Quotations', icon: 'file-text', component: QuotationListDevHelp },
    ],
  },
  {
    title: 'Products',
    entries: [
      { id: 'products', label: 'Products', icon: 'package', component: ProductListDevHelp },
      { id: 'packages', label: 'Packages', icon: 'archive', component: PackageListDevHelp },
    ],
  },
  {
    title: 'Activities',
    entries: [
      { id: 'activities', label: 'Activities', icon: 'calendar', component: ActivityListDevHelp },
      { id: 'tasks', label: 'Tasks', icon: 'check-square', component: TaskListDevHelp },
    ],
  },
  {
    title: 'Finance',
    entries: [
      { id: 'invoices', label: 'Invoices', icon: 'file-text', component: InvoiceListDevHelp },
      { id: 'payments', label: 'Payments', icon: 'credit-card', component: PaymentListDevHelp },
    ],
  },
  {
    title: 'Post-Sales',
    entries: [
      { id: 'post-sales', label: 'Installations / Training / Tickets', icon: 'tool', component: PostSalesDevHelp },
    ],
  },
  {
    title: 'System',
    entries: [
      { id: 'communication', label: 'Communication', icon: 'mail', component: CommunicationDevHelp },
      { id: 'workflows', label: 'Workflows', icon: 'git-branch', component: WorkflowDevHelp },
      { id: 'settings', label: 'Settings', icon: 'settings', component: SettingsDevHelp },
      { id: 'whatsapp-config', label: 'WhatsApp Config', icon: 'message-circle', component: WhatsAppConfigDevHelp },
      { id: 'email-config', label: 'Email Config', icon: 'mail', component: EmailConfigDevHelp },
      { id: 'cron-config', label: 'Cron Jobs', icon: 'clock', component: CronConfigDevHelp },
      { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart-2', component: DashboardDevHelp },
    ],
  },
];

// ── Component ───────────────────────────────────────────────

export function DocsTab() {
  const [activeDoc, setActiveDoc] = useState('contacts');

  const activeEntry = DOC_GROUPS.flatMap((g) => g.entries).find((e) => e.id === activeDoc);
  const ActiveComponent = activeEntry?.component;

  return (
    <div className="flex gap-4 -m-4">
      {/* Left sidebar nav */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 p-3 overflow-y-auto max-h-[700px]">
        {DOC_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {group.title}
            </p>
            {group.entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setActiveDoc(entry.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                  activeDoc === entry.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon name={entry.icon as any} size={14} />
                {entry.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right content area */}
      <div className="flex-1 overflow-y-auto max-h-[700px] p-4">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <p className="text-sm text-gray-400">Select a feature from the sidebar.</p>
        )}
      </div>
    </div>
  );
}
