'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MenuProvider } from '@/features/menu/menu-provider';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, isLoading, router, fetchMe]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <MenuProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className={cn('flex flex-1 flex-col overflow-hidden transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </MenuProvider>
  );
}
