'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '⬛' },
  { href: '/admin/vendors', label: 'Vendors', icon: '🏢' },
  { href: '/admin/modules', label: 'Modules', icon: '📦' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.role !== 'PLATFORM_ADMIN' && user?.role !== 'ADMIN') {
      router.replace('/feed');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'PLATFORM_ADMIN' && user?.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="flex min-h-dvh bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <span className="font-bold text-gray-900 text-sm">Marketplace Admin</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
