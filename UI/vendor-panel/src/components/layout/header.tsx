'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/listings': 'Listings',
  '/listings/new': 'New Listing',
  '/posts': 'Posts',
  '/orders': 'Orders',
  '/enquiries': 'Enquiries',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/profile': 'Profile',
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
