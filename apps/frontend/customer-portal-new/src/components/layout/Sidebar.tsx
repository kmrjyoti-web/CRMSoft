'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  MessageSquare,
  FolderOpen,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore, ALL_PORTAL_ROUTES } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  MessageSquare,
  FolderOpen,
  User,
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, availableRouteKeys, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const visibleRoutes = ALL_PORTAL_ROUTES.filter((r) => availableRouteKeys.includes(r.key));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">Customer Portal</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.linkedEntityType === 'ORGANIZATION' ? 'Organization' : 'Contact'}
              </p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8 shrink-0', sidebarCollapsed && 'ml-auto')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>
        )}
        <div className="space-y-1">
          {visibleRoutes.map((route) => {
            const Icon = ICON_MAP[route.icon] ?? LayoutDashboard;
            const isActive =
              route.path === '/'
                ? pathname === '/'
                : pathname === route.path || pathname.startsWith(route.path + '/');

            return (
              <Link
                key={route.key}
                href={route.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100',
                  sidebarCollapsed && 'justify-center px-2',
                )}
                title={sidebarCollapsed ? route.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{route.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t p-2 shrink-0">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg p-2',
            sidebarCollapsed && 'justify-center',
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user?.displayName ? getInitials(user.displayName) : 'C'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName ?? 'Customer'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-gray-500 hover:text-red-600 shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
