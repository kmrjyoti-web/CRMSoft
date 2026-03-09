'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, FileText, ShoppingCart, MessageSquare,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Store,
  User, Lock, Sparkles, Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useMenu } from '@/features/menu/menu-provider';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/common/upgrade-modal';
import type { AutoMenuItem } from '@/features/menu/auto-menu.service';

// Icon component map keyed by discovered-routes icon name
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  FileText, BarChart3, Settings, User, Circle,
};

function MenuItemRow({
  item,
  sidebarCollapsed,
}: {
  item: AutoMenuItem;
  sidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isActive =
    pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));
  const Icon = ICONS[item.icon] || Circle;

  const handleClick = (e: React.MouseEvent) => {
    if (item.isLocked) {
      e.preventDefault();
      setShowUpgrade(true);
      return;
    }
    router.push(item.path);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive && !item.isLocked
            ? 'bg-primary/10 text-primary font-medium'
            : item.isLocked
            ? 'text-gray-400 hover:bg-gray-50 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100',
          sidebarCollapsed && 'justify-center px-2',
        )}
        title={sidebarCollapsed ? item.label : undefined}
      >
        <Icon className={cn('h-5 w-5 shrink-0', item.isLocked && 'opacity-40')} />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.isLocked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
          </>
        )}
      </button>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName={item.label}
        moduleKey={item.moduleKey}
      />
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, vendor, logout } = useAuthStore();
  const { menu, isLoading } = useMenu();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b shrink-0">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Vendor Portal</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 shrink-0">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {isLoading ? (
          // Skeleton while menu loads
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          menu.map((item) => (
            <MenuItemRow
              key={item.key}
              item={item}
              sidebarCollapsed={sidebarCollapsed}
            />
          ))
        )}
      </nav>

      {/* Upgrade CTA */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2 shrink-0">
          <Link
            href="/settings"
            className="block bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Upgrade Plan</span>
            </div>
            <p className="text-xs opacity-80">Unlock all features</p>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t p-2 shrink-0">
        <div className={cn('flex items-center gap-3 rounded-lg p-2', sidebarCollapsed && 'justify-center')}>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {user?.firstName?.charAt(0) ?? 'V'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {vendor?.companyName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Vendor'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-gray-500 hover:text-red-600 shrink-0" title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
