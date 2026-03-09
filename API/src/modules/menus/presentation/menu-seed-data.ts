import { MenuSeedItem } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';

export const MENU_SEED_DATA: MenuSeedItem[] = [
  {
    name: 'Dashboard', code: 'DASHBOARD', icon: 'home',
    route: '/dashboard', permissionModule: 'dashboard', permissionAction: 'read',
  },
  { name: 'Divider 1', code: 'DIV_1', menuType: 'DIVIDER' },
  {
    name: 'Contacts', code: 'CONTACTS_GROUP', icon: 'users', menuType: 'GROUP',
    children: [
      {
        name: 'Raw Contacts', code: 'RAW_CONTACTS', icon: 'user-plus',
        route: '/raw-contacts', permissionModule: 'raw_contacts', permissionAction: 'read',
      },
      {
        name: 'Verified Contacts', code: 'CONTACTS', icon: 'user-check',
        route: '/contacts', permissionModule: 'contacts', permissionAction: 'read',
      },
      {
        name: 'Organizations', code: 'ORGANIZATIONS', icon: 'building',
        route: '/organizations', permissionModule: 'organizations', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Leads', code: 'LEADS', icon: 'trending-up',
    route: '/leads', permissionModule: 'leads', permissionAction: 'read',
  },
  {
    name: 'Communications', code: 'COMMUNICATIONS', icon: 'message-circle',
    route: '/communications', permissionModule: 'communications', permissionAction: 'read',
  },
  {
    name: 'Calendar', code: 'CALENDAR', icon: 'calendar',
    route: '/calendar', permissionModule: 'calendar', permissionAction: 'read',
    badgeText: 'New', badgeColor: '#3B82F6',
  },
  {
    name: 'Tasks', code: 'TASKS', icon: 'check-square',
    route: '/tasks', permissionModule: 'tasks', permissionAction: 'read',
    badgeText: 'New', badgeColor: '#3B82F6',
  },
  { name: 'Divider 2', code: 'DIV_2', menuType: 'DIVIDER' },
  {
    name: 'Activities', code: 'ACTIVITIES_GROUP', icon: 'activity', menuType: 'GROUP',
    children: [
      {
        name: 'All Activities', code: 'ACTIVITIES', icon: 'list',
        route: '/activities', permissionModule: 'activities', permissionAction: 'read',
      },
      {
        name: 'Demos', code: 'DEMOS', icon: 'monitor',
        route: '/demos', permissionModule: 'demos', permissionAction: 'read',
      },
      {
        name: 'Tour Plans', code: 'TOUR_PLANS', icon: 'map',
        route: '/tour-plans', permissionModule: 'tour_plans', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Products', code: 'PRODUCTS_GROUP', icon: 'package', menuType: 'GROUP',
    children: [
      {
        name: 'Products', code: 'PRODUCTS', icon: 'package',
        route: '/products/products', permissionModule: 'products', permissionAction: 'read',
      },
      {
        name: 'Packages', code: 'PACKAGES', icon: 'archive',
        route: '/products/packages', permissionModule: 'packages', permissionAction: 'read',
      },
      {
        name: 'Units', code: 'UNITS', icon: 'hash',
        route: '/products/units', permissionModule: 'products', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Quotations', code: 'QUOTATIONS', icon: 'file-text',
    route: '/quotations', permissionModule: 'quotations', permissionAction: 'read',
  },
  {
    name: 'Finance', code: 'FINANCE_GROUP', icon: 'credit-card', menuType: 'GROUP',
    children: [
      {
        name: 'Proforma Invoices', code: 'PROFORMA_INVOICES', icon: 'file-check',
        route: '/finance/proforma-invoices', permissionModule: 'invoices', permissionAction: 'read',
      },
      {
        name: 'Invoices', code: 'INVOICES', icon: 'file-text',
        route: '/finance/invoices', permissionModule: 'invoices', permissionAction: 'read',
      },
      {
        name: 'Payments', code: 'PAYMENTS', icon: 'credit-card',
        route: '/finance/payments', permissionModule: 'payments', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Post-Sales', code: 'POST_SALES_GROUP', icon: 'tool', menuType: 'GROUP',
    children: [
      {
        name: 'Installations', code: 'INSTALLATIONS', icon: 'tool',
        route: '/post-sales/installations', permissionModule: 'installations', permissionAction: 'read',
      },
      {
        name: 'Trainings', code: 'TRAININGS', icon: 'book-open',
        route: '/post-sales/trainings', permissionModule: 'trainings', permissionAction: 'read',
      },
      {
        name: 'Tickets', code: 'TICKETS', icon: 'headphones',
        route: '/post-sales/tickets', permissionModule: 'support-tickets', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Documents', code: 'DOCUMENTS', icon: 'file-text',
    route: '/documents', permissionModule: 'documents', permissionAction: 'read',
  },
  {
    name: 'Communication', code: 'COMMUNICATION_GROUP', icon: 'mail', menuType: 'GROUP',
    children: [
      {
        name: 'Templates', code: 'COMM_TEMPLATES', icon: 'file-text',
        route: '/communication/templates', permissionModule: 'communication', permissionAction: 'read',
      },
      {
        name: 'Signatures', code: 'COMM_SIGNATURES', icon: 'edit',
        route: '/communication/signatures', permissionModule: 'communication', permissionAction: 'read',
      },
    ],
  },
  {
    name: 'Workflows', code: 'WORKFLOWS', icon: 'git-branch',
    route: '/workflows', permissionModule: 'workflows', permissionAction: 'read',
  },
  {
    name: 'WhatsApp', code: 'WHATSAPP_GROUP', icon: 'message-circle', menuType: 'GROUP',
    children: [
      {
        name: 'Dashboard', code: 'WA_DASHBOARD', icon: 'bar-chart-2',
        route: '/whatsapp', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Conversations', code: 'WA_CONVERSATIONS', icon: 'message-square',
        route: '/whatsapp/conversations', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Templates', code: 'WA_TEMPLATES', icon: 'file-text',
        route: '/whatsapp/templates', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Broadcasts', code: 'WA_BROADCASTS', icon: 'radio',
        route: '/whatsapp/broadcasts', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Chatbot', code: 'WA_CHATBOT', icon: 'bot',
        route: '/whatsapp/chatbot', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Quick Replies', code: 'WA_QUICK_REPLIES', icon: 'zap',
        route: '/whatsapp/quick-replies', permissionModule: 'whatsapp', permissionAction: 'read',
      },
      {
        name: 'Opt-outs', code: 'WA_OPT_OUTS', icon: 'user-x',
        route: '/whatsapp/opt-outs', permissionModule: 'whatsapp', permissionAction: 'read',
      },
    ],
  },
  { name: 'Divider 3', code: 'DIV_3', menuType: 'DIVIDER' },
  {
    name: 'Reports', code: 'REPORTS_GROUP', icon: 'bar-chart-2', menuType: 'GROUP',
    children: [
      {
        name: 'All Reports', code: 'REPORTS_ALL', icon: 'bar-chart',
        route: '/reports', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Sales Reports', code: 'REPORTS_SALES', icon: 'dollar-sign',
        route: '/reports?category=SALES', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Lead Reports', code: 'REPORTS_LEADS', icon: 'trending-up',
        route: '/reports?category=LEAD', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Contact & Org', code: 'REPORTS_CONTACTS', icon: 'users',
        route: '/reports?category=CONTACT_ORG', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Activity Reports', code: 'REPORTS_ACTIVITIES', icon: 'activity',
        route: '/reports?category=ACTIVITY', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Demo Reports', code: 'REPORTS_DEMOS', icon: 'monitor',
        route: '/reports?category=DEMO', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Quotation Reports', code: 'REPORTS_QUOTATIONS', icon: 'file-text',
        route: '/reports?category=QUOTATION', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Tour Plan Reports', code: 'REPORTS_TOUR_PLANS', icon: 'map',
        route: '/reports?category=TOUR_PLAN', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Team Reports', code: 'REPORTS_TEAM', icon: 'user-check',
        route: '/reports?category=TEAM', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Communication', code: 'REPORTS_COMMUNICATION', icon: 'mail',
        route: '/reports?category=COMMUNICATION', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Executive Reports', code: 'REPORTS_EXECUTIVE', icon: 'briefcase',
        route: '/reports?category=EXECUTIVE', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Custom Reports', code: 'REPORTS_CUSTOM', icon: 'sliders',
        route: '/reports?category=CUSTOM', permissionModule: 'reports', permissionAction: 'read',
      },
      {
        name: 'Report Designer', code: 'REPORTS_DESIGNER', icon: 'layout',
        route: '/reports/designer', permissionModule: 'reports', permissionAction: 'create',
      },
    ],
  },
  { name: 'Divider 4', code: 'DIV_4', menuType: 'DIVIDER' },
  {
    name: 'Settings', code: 'SETTINGS_GROUP', icon: 'settings', menuType: 'GROUP',
    children: [
      {
        name: 'Users', code: 'SETTINGS_USERS', icon: 'users',
        route: '/settings/users', permissionModule: 'users', permissionAction: 'read',
      },
      {
        name: 'Roles & Permissions', code: 'SETTINGS_ROLES', icon: 'shield',
        route: '/settings/roles', permissionModule: 'roles', permissionAction: 'read',
      },
      {
        name: 'Departments', code: 'SETTINGS_DEPARTMENTS', icon: 'building-2',
        route: '/settings/departments', permissionModule: 'departments', permissionAction: 'read',
      },
      {
        name: 'Designations', code: 'SETTINGS_DESIGNATIONS', icon: 'briefcase',
        route: '/settings/designations', permissionModule: 'designations', permissionAction: 'read',
      },
      {
        name: 'Lookups', code: 'SETTINGS_LOOKUPS', icon: 'list',
        route: '/settings/lookups', permissionModule: 'lookups', permissionAction: 'read',
      },
      {
        name: 'Menu Management', code: 'SETTINGS_MENUS', icon: 'menu',
        route: '/settings/menus', permissionModule: 'menus', permissionAction: 'read',
      },
      {
        name: 'Data Masking', code: 'SETTINGS_DATA_MASKING', icon: 'eye-off',
        route: '/settings/data-masking', permissionModule: 'users', permissionAction: 'read',
      },
      {
        name: 'Recycle Bin', code: 'SETTINGS_RECYCLE_BIN', icon: 'trash-2',
        route: '/settings/recycle-bin', permissionModule: 'users', permissionAction: 'read',
      },
      {
        name: 'Audit Logs', code: 'SETTINGS_AUDIT_LOGS', icon: 'file-clock',
        route: '/settings/audit-logs', permissionModule: 'users', permissionAction: 'read',
      },
      {
        name: 'Google', code: 'SETTINGS_GOOGLE', icon: 'globe',
        route: '/settings/google', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'AI Models', code: 'SETTINGS_AI', icon: 'cpu',
        route: '/settings/ai', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Integrations', code: 'SETTINGS_INTEGRATIONS', icon: 'link',
        route: '/settings/integrations', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Subscription', code: 'SETTINGS_SUBSCRIPTION', icon: 'crown',
        route: '/settings/subscription', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Wallet', code: 'SETTINGS_WALLET', icon: 'wallet',
        route: '/settings/wallet', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Coupons', code: 'SETTINGS_COUPONS', icon: 'tag',
        route: '/settings/coupons', permissionModule: 'settings', permissionAction: 'read',
      },
    ],
  },
  { name: 'Divider 5', code: 'DIV_5', menuType: 'DIVIDER' },
  {
    name: 'Developer', code: 'DEVELOPER_GROUP', icon: 'code', menuType: 'GROUP',
    permissionModule: 'settings', permissionAction: 'read',
    children: [
      {
        name: 'Developer Tools', code: 'DEV_TOOLS', icon: 'terminal',
        route: '/settings/developer', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'API Keys', code: 'DEV_API_KEYS', icon: 'key',
        route: '/settings/developer', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Webhooks', code: 'DEV_WEBHOOKS', icon: 'link',
        route: '/settings/developer', permissionModule: 'settings', permissionAction: 'read',
      },
      {
        name: 'Logs', code: 'DEV_LOGS', icon: 'scroll-text',
        route: '/settings/developer', permissionModule: 'settings', permissionAction: 'read',
      },
    ],
  },
  { name: 'Divider 6', code: 'DIV_6', menuType: 'DIVIDER' },
  {
    name: 'Software Vendor', code: 'SOFTWARE_VENDOR_GROUP', icon: 'shield', menuType: 'GROUP',
    permissionModule: 'admin', permissionAction: 'read',
    children: [
      {
        name: 'Vendor Dashboard', code: 'SV_DASHBOARD', icon: 'bar-chart-2',
        route: '/admin/vendor', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Plans', code: 'SV_PLANS', icon: 'crown',
        route: '/admin/plans', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Tenants', code: 'SV_TENANTS', icon: 'building-2',
        route: '/admin/tenants', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Licenses', code: 'SV_LICENSES', icon: 'key',
        route: '/admin/licenses', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Offers', code: 'SV_OFFERS', icon: 'gift',
        route: '/admin/offers', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Modules', code: 'SV_MODULES', icon: 'layers',
        route: '/admin/modules', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Recharge Plans', code: 'SV_RECHARGE_PLANS', icon: 'credit-card',
        route: '/admin/recharge-plans', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Coupons', code: 'SV_COUPONS', icon: 'tag',
        route: '/admin/coupons', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Service Rates', code: 'SV_SERVICE_RATES', icon: 'zap',
        route: '/admin/service-rates', permissionModule: 'admin', permissionAction: 'read',
      },
      {
        name: 'Wallet Analytics', code: 'SV_WALLET_ANALYTICS', icon: 'bar-chart',
        route: '/admin/wallet', permissionModule: 'admin', permissionAction: 'read',
      },
    ],
  },
];
