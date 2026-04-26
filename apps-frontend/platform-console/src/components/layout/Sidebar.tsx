'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  HeartPulse,
  GitBranch,
  TestTube2,
  Factory,
  Building2,
  Shield,
  Rocket,
  Menu,
  Settings,
  Zap,
  ChevronDown,
  ChevronRight,
  ListFilter,
  ArrowUpCircle,
  Bot,
  Tag,
  Bell,
  History,
  Palette,
  Plus,
  Layers,
  FileText,
  Users,
  ListChecks,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  soon?: boolean;
  children?: NavItem[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    label: 'Error Center', icon: AlertTriangle, href: '/errors', badge: 'live',
    children: [
      { label: 'All Errors', icon: ListFilter, href: '/errors' },
      { label: 'Escalated', icon: ArrowUpCircle, href: '/errors/escalated' },
      { label: 'Auto-Reports', icon: Bot, href: '/errors/auto-reports' },
      { label: 'By Brand', icon: Tag, href: '/errors/by-brand' },
    ],
  },
  {
    label: 'Alerts', icon: Bell, href: '/alerts',
    children: [
      { label: 'Rules', icon: Bell, href: '/alerts' },
      { label: 'History', icon: History, href: '/alerts/history' },
    ],
  },
  {
    label: 'Version Manager', icon: GitBranch, href: '/versions',
    children: [
      { label: 'Releases', icon: GitBranch, href: '/versions' },
      { label: 'Rollback History', icon: History, href: '/versions/rollbacks' },
      { label: 'New Release', icon: GitBranch, href: '/versions/new' },
    ],
  },
  {
    label: 'Vertical Manager', icon: Factory, href: '/verticals',
    children: [
      { label: 'Registry', icon: Factory, href: '/verticals' },
      { label: 'Create Vertical', icon: Plus, href: '/verticals/create' },
      { label: 'Menu Builder', icon: Menu, href: '/verticals' },
    ],
  },
  { label: 'Health Monitor', icon: HeartPulse, href: '/health' },
  {
    label: 'Test Center', icon: TestTube2, href: '/tests',
    children: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/tests' },
      { label: 'Plans', icon: ListFilter, href: '/tests/plans' },
      { label: 'Executions', icon: History, href: '/tests/executions' },
      { label: 'Schedules', icon: Bell, href: '/tests/schedules' },
      { label: 'Coverage', icon: HeartPulse, href: '/tests/coverage' },
    ],
  },
  {
    label: 'Brand Manager', icon: Building2, href: '/brands',
    children: [
      { label: 'All Brands', icon: Building2, href: '/brands' },
      { label: 'Error Overview', icon: AlertTriangle, href: '/brands/errors' },
    ],
  },
  {
    label: 'Brand Config', icon: Palette, href: '/brand-config',
    children: [
      { label: 'All Brands', icon: Building2, href: '/brand-config' },
      { label: 'Create Brand', icon: Plus, href: '/brand-config/new' },
    ],
  },
  {
    label: 'Menu Management', icon: Menu, href: '/menus',
    children: [
      { label: 'Global Menu', icon: Menu, href: '/menus' },
      { label: 'New Item', icon: Menu, href: '/menus/new' },
    ],
  },
  {
    label: 'Governance', icon: Layers, href: '/governance',
    children: [
      { label: 'Overview', icon: LayoutDashboard, href: '/governance' },
      { label: 'Code Builder', icon: Zap, href: '/governance/combined-codes/builder' },
      { label: 'Combined Codes', icon: ListFilter, href: '/governance/combined-codes' },
      { label: 'Partners', icon: Users, href: '/governance/partners' },
      { label: 'Brands', icon: Palette, href: '/governance/brands' },
      { label: 'CRM Editions', icon: Factory, href: '/governance/crm-editions' },
      { label: 'Verticals', icon: Tag, href: '/governance/verticals' },
      { label: 'Sub-Types', icon: Building2, href: '/governance/sub-types' },
      { label: 'Page Registry', icon: FileText, href: '/governance/page-registry' },
      { label: 'Onboarding Stages', icon: ListChecks, href: '/governance/onboarding-stages' },
    ],
  },
  {
    label: 'Security & DR', icon: Shield, href: '/security',
    children: [
      { label: 'Dashboard', icon: Shield, href: '/security' },
      { label: 'Incidents', icon: AlertTriangle, href: '/security/incidents' },
      { label: 'DR Plans', icon: Shield, href: '/security/dr-plans' },
      { label: 'Notifications', icon: Bell, href: '/security/notifications' },
    ],
  },
  {
    label: 'CI/CD', icon: Rocket, href: '/cicd',
    children: [
      { label: 'Dashboard', icon: Rocket, href: '/cicd' },
      { label: 'Deployments', icon: Rocket, href: '/cicd/deployments' },
      { label: 'Pipelines', icon: GitBranch, href: '/cicd/pipelines' },
    ],
  },
  { label: 'Settings', icon: Settings, href: '/settings', soon: true },
];

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if current path is under this section
  const isActive = pathname === item.href || (hasChildren && item.children!.some((c) => pathname.startsWith(c.href)));
  const [open, setOpen] = useState(isActive);

  const Icon = item.icon;
  const activeLeaf = pathname === item.href || (!hasChildren && pathname.startsWith(item.href));

  if (item.soon) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm text-console-muted cursor-default opacity-50',
          depth > 0 && 'pl-8',
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        <span className="text-xs text-console-muted/60">soon</span>
      </div>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
            isActive
              ? 'bg-console-accent/10 text-console-accent'
              : 'text-console-muted hover:text-console-text hover:bg-white/5',
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="text-xs bg-console-danger text-white px-1.5 py-0.5 rounded-full mr-1">
              {item.badge}
            </span>
          )}
          {open ? (
            <ChevronDown className="w-3 h-3 opacity-60" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-60" />
          )}
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group',
        depth > 0 && 'pl-8',
        activeLeaf
          ? 'bg-console-accent/20 text-console-accent'
          : 'text-console-muted hover:text-console-text hover:bg-white/5',
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs bg-console-danger text-white px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-console-sidebar border-r border-console-border flex flex-col z-10">
      {/* Logo */}
      <div className="p-4 border-b border-console-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-console-accent rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-console-text">Platform Console</p>
            <p className="text-xs text-console-muted">CRMSoft DevOps</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-console-border">
        <p className="text-xs text-console-muted text-center">Platform Console — Complete</p>
      </div>
    </aside>
  );
}
