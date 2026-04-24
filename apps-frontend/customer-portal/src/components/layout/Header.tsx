'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/support': 'Support',
  '/documents': 'Documents',
  '/profile': 'My Profile',
};

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const title = ROUTE_TITLES[pathname] ?? 'Portal';

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden h-8 w-8">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>
        <div className={cn('flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100')}>
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {user?.displayName?.charAt(0).toUpperCase() ?? 'C'}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.displayName ?? 'Customer'}
          </span>
        </div>
      </div>
    </header>
  );
}
