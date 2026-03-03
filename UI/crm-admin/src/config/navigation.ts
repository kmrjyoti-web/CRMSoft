import type { IconName } from '@/components/ui';

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  permission?: string;
  children?: NavItem[];
}

// Fallback menu — actual menu comes from API via menu.store.ts
export const DEFAULT_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Contacts', path: '/contacts', icon: 'users', permission: 'contacts:view' },
  { label: 'Raw Contacts', path: '/raw-contacts', icon: 'user-plus', permission: 'raw-contacts:view' },
  { label: 'Organizations', path: '/organizations', icon: 'building', permission: 'organizations:view' },
  { label: 'Leads', path: '/leads', icon: 'trending-up', permission: 'leads:view' },
  {
    label: 'Activities', path: '/activities', icon: 'calendar', permission: 'activities:view',
    children: [
      { label: 'All Activities', path: '/activities', icon: 'calendar' },
      { label: 'Follow-ups', path: '/follow-ups', icon: 'phone' },
      { label: 'Tour Plans', path: '/tour-plans', icon: 'map-pin' },
    ],
  },
  { label: 'Products', path: '/products', icon: 'package', permission: 'products:view' },
  { label: 'Quotations', path: '/quotations', icon: 'file-text', permission: 'quotations:view' },
  {
    label: 'Finance', path: '/finance/invoices', icon: 'credit-card', permission: 'finance:view',
    children: [
      { label: 'Invoices', path: '/finance/invoices', icon: 'file-text' },
      { label: 'Payments', path: '/finance/payments', icon: 'credit-card' },
    ],
  },
  {
    label: 'Post-Sales', path: '/post-sales/installations', icon: 'tool', permission: 'post-sales:view',
    children: [
      { label: 'Installations', path: '/post-sales/installations', icon: 'tool' },
      { label: 'Trainings', path: '/post-sales/trainings', icon: 'book-open' },
      { label: 'Tickets', path: '/post-sales/tickets', icon: 'headphones' },
    ],
  },
  {
    label: 'Communication', path: '/communication/templates', icon: 'mail', permission: 'communication:view',
    children: [
      { label: 'Templates', path: '/communication/templates', icon: 'file-text' },
      { label: 'Signatures', path: '/communication/signatures', icon: 'edit' },
    ],
  },
  { label: 'Workflows', path: '/workflows', icon: 'git-branch', permission: 'workflows:view' },
  { label: 'Reports', path: '/reports', icon: 'bar-chart', permission: 'reports:view' },
  { label: 'Recycle Bin', path: '/recycle-bin', icon: 'trash-2' },
  {
    label: 'Settings', path: '/settings', icon: 'settings', permission: 'settings:view',
    children: [
      { label: 'Users', path: '/settings/users', icon: 'users' },
      { label: 'Roles', path: '/settings/roles', icon: 'shield' },
      { label: 'Permissions', path: '/settings/permissions', icon: 'lock' },
      { label: 'Lookups', path: '/settings/lookups', icon: 'list' },
      { label: 'Menus', path: '/settings/menus', icon: 'menu' },
      { label: 'Developer Tools', path: '/settings/developer', icon: 'code', permission: 'settings.developer' },
    ],
  },
];
