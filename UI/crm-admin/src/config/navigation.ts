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
  { label: 'Calendar', path: '/calendar', icon: 'calendar', permission: 'calendar:view' },
  { label: 'Tasks', path: '/tasks', icon: 'check-square', permission: 'tasks:view' },
  {
    label: 'Activities', path: '/activities', icon: 'activity', permission: 'activities:view',
    children: [
      { label: 'All Activities', path: '/activities', icon: 'activity' },
      { label: 'Follow-ups', path: '/follow-ups', icon: 'phone' },
      { label: 'Tour Plans', path: '/tour-plans', icon: 'map-pin' },
    ],
  },
  {
    label: 'Products', path: '/products/products', icon: 'package', permission: 'products:view',
    children: [
      { label: 'Products', path: '/products/products', icon: 'package' },
      { label: 'Packages', path: '/products/packages', icon: 'archive' },
      { label: 'Units', path: '/products/units', icon: 'hash' },
    ],
  },
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
  { label: 'Documents', path: '/documents', icon: 'file-text', permission: 'documents:view' },
  { label: 'Reports', path: '/reports', icon: 'bar-chart', permission: 'reports:view' },
  {
    label: 'WhatsApp', path: '/whatsapp', icon: 'message-circle', permission: 'whatsapp:view',
    children: [
      { label: 'Dashboard', path: '/whatsapp', icon: 'bar-chart-2' },
      { label: 'Conversations', path: '/whatsapp/conversations', icon: 'message-square' },
      { label: 'Templates', path: '/whatsapp/templates', icon: 'file-text' },
      { label: 'Broadcasts', path: '/whatsapp/broadcasts', icon: 'radio' },
      { label: 'Chatbot', path: '/whatsapp/chatbot', icon: 'bot' },
      { label: 'Quick Replies', path: '/whatsapp/quick-replies', icon: 'zap' },
      { label: 'Opt-outs', path: '/whatsapp/opt-outs', icon: 'user-x' },
    ],
  },
  { label: 'Recycle Bin', path: '/recycle-bin', icon: 'trash-2' },
  {
    label: 'Settings', path: '/settings', icon: 'settings', permission: 'settings:view',
    children: [
      { label: 'Users', path: '/settings/users', icon: 'users' },
      { label: 'Roles', path: '/settings/roles', icon: 'shield' },
      { label: 'Permissions', path: '/settings/permissions', icon: 'lock' },
      { label: 'Lookups', path: '/settings/lookups', icon: 'list' },
      { label: 'Menus', path: '/settings/menus', icon: 'menu' },
      { label: 'Data Masking', path: '/settings/data-masking', icon: 'eye-off' },
      { label: 'Google', path: '/settings/google', icon: 'globe' },
      { label: 'AI Models', path: '/settings/ai', icon: 'cpu' },
      { label: 'Integrations', path: '/settings/integrations', icon: 'link' },
      { label: 'Subscription', path: '/settings/subscription', icon: 'crown' },
      { label: 'Wallet', path: '/settings/wallet', icon: 'wallet' },
    ],
  },
  {
    label: 'Developer', path: '/settings/developer', icon: 'code', permission: 'settings:view',
    children: [
      { label: 'Developer Tools', path: '/settings/developer', icon: 'terminal' },
      { label: 'API Keys', path: '/settings/developer', icon: 'key' },
      { label: 'Webhooks', path: '/settings/developer', icon: 'link' },
      { label: 'Logs', path: '/settings/developer', icon: 'scroll-text' },
    ],
  },
  {
    label: 'Software Vendor', path: '/admin/vendor', icon: 'shield', permission: 'admin:view',
    children: [
      { label: 'Vendor Dashboard', path: '/admin/vendor', icon: 'bar-chart-2' },
      { label: 'Plans', path: '/admin/plans', icon: 'crown' },
      { label: 'Tenants', path: '/admin/tenants', icon: 'building-2' },
      { label: 'Licenses', path: '/admin/licenses', icon: 'key' },
      { label: 'Offers', path: '/admin/offers', icon: 'gift' },
      { label: 'Modules', path: '/admin/modules', icon: 'layers' },
      { label: 'Recharge Plans', path: '/admin/recharge-plans', icon: 'credit-card' },
      { label: 'Coupons', path: '/admin/coupons', icon: 'tag' },
      { label: 'Service Rates', path: '/admin/service-rates', icon: 'zap' },
      { label: 'Wallet Analytics', path: '/admin/wallet', icon: 'bar-chart' },
    ],
  },
];
