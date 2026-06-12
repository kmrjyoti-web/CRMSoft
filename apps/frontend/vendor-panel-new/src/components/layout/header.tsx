'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/modules': 'Modules',
  '/modules/new': 'New Module',
  '/packages': 'Packages',
  '/packages/new': 'New Package',
  '/licenses': 'Licenses',
  '/partners': 'Partners',
  '/wallet': 'Wallet',
  '/tenants': 'Tenants',
  '/error-logs': 'Error Logs',
  '/audit-logs': 'Audit Logs',
  '/system-health': 'System Health',
  '/module-builder': 'Module Builder',
  '/subscription-analytics': 'Subscription Analytics',
  '/ai-tokens': 'AI Token Management',
  '/webhooks': 'Webhooks',
  '/dev-requests': 'Dev Requests',
  '/db-admin': 'DB Administration',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/vendor-dashboard': 'Vendor Dashboard',
  '/plans': 'Plans',
  '/offers': 'Offers',
  '/recharge-plans': 'Recharge Plans',
  '/coupons': 'Coupons',
  '/service-rates': 'Service Rates',
  '/wallet-analytics': 'Wallet Analytics',
  '/dev-tools': 'Developer Tools',
  '/dev-tools/ui-kit': 'UI Kit',
  '/dev-tools/api-docs': 'API Docs',
};

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();

  const pageTitle = BREADCRUMB_MAP[pathname] ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Page';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold capitalize">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-gray-500">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </div>
    </header>
  );
}
