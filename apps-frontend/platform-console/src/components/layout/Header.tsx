'use client';

import { usePathname, useRouter } from 'next/navigation';
import { RefreshCw, LogOut } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/errors': 'Error Center',
  '/errors/escalated': 'Escalated Errors',
  '/errors/auto-reports': 'Auto-Reports',
  '/errors/by-brand': 'Errors by Brand',
  '/health': 'Health Monitor',
  '/alerts': 'Alert Rules',
  '/alerts/history': 'Alert History',
  '/versions': 'Version Manager',
  '/versions/new': 'New Release',
  '/versions/rollbacks': 'Rollback History',
  '/verticals': 'Vertical Manager',
  '/tests': 'Test Center',
  '/tests/plans': 'Test Plans',
  '/tests/plans/new': 'New Test Plan',
  '/tests/executions': 'Test Executions',
  '/tests/schedules': 'Test Schedules',
  '/tests/coverage': 'Coverage Report',
  '/brands': 'Brand Manager',
  '/brands/errors': 'Brand Error Overview',
  '/menus': 'Menu Management',
  '/menus/new': 'New Menu Item',
  '/security': 'Security & DR',
  '/security/incidents': 'Incidents',
  '/security/incidents/new': 'New Incident',
  '/security/dr-plans': 'DR Plans',
  '/security/notifications': 'Notifications',
  '/cicd': 'CI/CD',
  '/cicd/deployments': 'Deployments',
  '/cicd/pipelines': 'Pipelines',
};

function handleLogout(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem('pc_token');
  localStorage.removeItem('pc_user');
  document.cookie = 'pc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  router.push('/login');
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? 'Platform Console';

  const user = (() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('pc_user') ?? 'null'); } catch { return null; }
  })();

  return (
    <header className="h-14 border-b border-console-border bg-console-sidebar/50 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-console-text">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-console-accent animate-pulse" />
        <span className="text-xs text-console-muted">Live</span>
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 rounded hover:bg-white/5 text-console-muted hover:text-console-text transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        {user && (
          <span className="text-xs text-console-muted pl-2 border-l border-console-border">
            {user.email ?? user.firstName}
          </span>
        )}
        <button
          onClick={() => handleLogout(router)}
          title="Sign out"
          className="p-1.5 rounded hover:bg-white/5 text-console-muted hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
