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
  // ─────────────────────────────────────────────────────────────
  // 1. DASHBOARD
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard',
    children: [
      { label: 'Overview', path: '/dashboard', icon: 'layout-dashboard' },
      { label: 'My Dashboard', path: '/dashboard/my', icon: 'user' },
      { label: 'Sales Analytics', path: '/analytics?view=sales', icon: 'dollar-sign' },
      { label: 'Lead Analytics', path: '/analytics?view=leads', icon: 'trending-up' },
      { label: 'Revenue Trends', path: '/analytics?view=revenue', icon: 'bar-chart' },
      { label: 'Performance', path: '/analytics?view=performance', icon: 'activity' },
      { label: 'KPI Dashboard', path: '/analytics?view=kpi', icon: 'target' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. MIS
  // ─────────────────────────────────────────────────────────────
  {
    label: 'MIS', path: '/reports', icon: 'bar-chart-3',
    children: [
      {
        label: 'BI', path: '/analytics', icon: 'pie-chart',
        children: [
          { label: 'All BI', path: '/reports', icon: 'layout-dashboard' },
        ],
      },
      {
        label: 'Report', path: '/reports', icon: 'file-bar-chart',
        children: [
          { label: 'Report Designer', path: '/settings/templates', icon: 'pen-tool' },
          { label: 'My Reports', path: '/reports/saved', icon: 'bookmark' },
        ],
      },
      { label: 'Scheduled Reports', path: '/reports/scheduled', icon: 'clock' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. CRM
  // ─────────────────────────────────────────────────────────────
  {
    label: 'CRM', path: '/contacts', icon: 'users',
    children: [
      {
        label: 'Contact Master', path: '/contacts', icon: 'user-check',
        children: [
          { label: 'Dashboard', path: '/contacts/dashboard', icon: 'layout-dashboard', permission: 'contacts:view' },
          { label: 'All Records', path: '/contacts/all-records', icon: 'list', permission: 'contacts:view' },
          { label: 'Statistics', path: '/contacts/statistics', icon: 'bar-chart-2', permission: 'contacts:view' },
          { label: 'Raw Contacts', path: '/raw-contacts', icon: 'user-plus', permission: 'raw-contacts:view' },
          { label: 'Contacts', path: '/contacts', icon: 'users', permission: 'contacts:view' },
          { label: 'Organizations', path: '/organizations', icon: 'building', permission: 'organizations:view' },
        ],
      },
      { label: 'Leads', path: '/leads', icon: 'trending-up', permission: 'leads:view' },
      { label: 'Activities', path: '/activities', icon: 'activity', permission: 'activities:view' },
      { label: 'Follow-ups', path: '/follow-ups', icon: 'phone' },
      { label: 'Tour Plans', path: '/tour-plans', icon: 'map-pin' },
      { label: 'Tasks', path: '/tasks', icon: 'check-square', permission: 'tasks:view' },
      { label: 'Calendar', path: '/calendar', icon: 'calendar', permission: 'calendar:view' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. MASTER — true 3-level: Master → sub-group → leaf pages
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Master', path: '/master/accounts', icon: 'database',
    children: [
      {
        label: 'Accounts Master', path: '/master/accounts', icon: 'coins',
        children: [
          { label: 'Ledger', path: '/accounts/ledger', icon: 'book-open' },
          { label: 'Account Groups', path: '/accounts/groups', icon: 'folder-tree' },
          { label: 'Sale Master', path: '/accounts/sale', icon: 'file-text' },
          { label: 'Purchase Master', path: '/accounts/purchase', icon: 'shopping-cart' },
          { label: 'Ledger Mappings', path: '/accounts/ledger-mappings', icon: 'link' },
        ],
      },
      {
        label: 'Inventory Master', path: '/master/inventory', icon: 'package',
        children: [
          { label: 'Items / Products', path: '/inventory/items', icon: 'package' },
          { label: 'Store / Warehouse', path: '/inventory/stores', icon: 'warehouse' },
          { label: 'Company / Brand', path: '/inventory/companies', icon: 'building' },
          { label: 'Item Groups', path: '/inventory/groups', icon: 'folder' },
          { label: 'Units', path: '/inventory/units', icon: 'ruler' },
          { label: 'Manufacturers', path: '/inventory/manufacturers', icon: 'factory' },
        ],
      },
      {
        label: 'Rate Master', path: '/master/rate', icon: 'tag',
        children: [
          { label: 'Price Lists', path: '/pricing/price-lists', icon: 'list' },
          { label: 'Price Tiers', path: '/pricing/tiers', icon: 'layers' },
          { label: 'Batch Pricing', path: '/pricing/batch', icon: 'database' },
        ],
      },
      {
        label: 'Discount Master', path: '/master/discount', icon: 'percent',
        children: [
          { label: 'Agency Discount', path: '/discount-master/agency', icon: 'tag' },
          { label: 'Item Discount', path: '/discount-master/item', icon: 'package' },
          { label: 'Promotions', path: '/promotions', icon: 'gift' },
        ],
      },
      { label: 'Other Master', path: '/master/other', icon: 'folder' },
      { label: 'Opening Balance', path: '/master/opening-balance', icon: 'scale' },
      { label: 'Currency', path: '/master/currency', icon: 'banknote' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. SALE
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Sale', path: '/quotations', icon: 'indian-rupee',
    children: [
      { label: 'Dashboard', path: '/sales/dashboard', icon: 'layout-dashboard' },
      { label: 'Quotations', path: '/quotations', icon: 'file-text', permission: 'sales:view' },
      { label: 'Proforma Invoice', path: '/sales/proforma', icon: 'file-minus' },
      { label: 'Sale Orders', path: '/sales/orders', icon: 'clipboard-list' },
      { label: 'Delivery Challan', path: '/sales/delivery-challans', icon: 'truck' },
      { label: 'Sale Invoice', path: '/finance/invoices', icon: 'receipt' },
      { label: 'Sale Returns', path: '/sales/returns', icon: 'rotate-ccw' },
      { label: 'Credit Notes', path: '/sales/credit-notes', icon: 'file-minus' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. PURCHASE
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Purchase', path: '/procurement', icon: 'shopping-cart',
    children: [
      { label: 'Dashboard', path: '/procurement', icon: 'layout-dashboard', permission: 'procurement:view' },
      { label: 'RFQ', path: '/procurement/rfq', icon: 'file-question' },
      { label: 'Purchase Quotations', path: '/procurement/quotations', icon: 'file-text' },
      { label: 'Compare Quotations', path: '/procurement/compare', icon: 'git-compare' },
      { label: 'Purchase Orders', path: '/procurement/purchase-orders', icon: 'clipboard-list' },
      { label: 'Goods Receipt', path: '/procurement/goods-receipts', icon: 'package-check' },
      { label: 'Purchase Invoice', path: '/procurement/invoices', icon: 'receipt' },
      { label: 'Debit Notes', path: '/sales/debit-notes', icon: 'file-plus' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. ACCOUNTING TRANSACTIONS
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Accounting Trans.', path: '/accounts/transactions', icon: 'receipt',
    children: [
      { label: 'Dashboard', path: '/accounts/transactions', icon: 'layout-dashboard', permission: 'accounts:view' },
      { label: 'Journal Entry', path: '/accounts/journal-entries', icon: 'book-open', permission: 'accounts:view' },
      { label: 'Payment In', path: '/accounts/payments?type=receipt', icon: 'arrow-down-circle' },
      { label: 'Payment Out', path: '/accounts/payments?type=payment', icon: 'arrow-up-circle' },
      { label: 'Contra Entry', path: '/accounts/contra', icon: 'arrow-left-right' },
      { label: 'TDS Entries', path: '/accounts/tds', icon: 'percent' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. STOCK MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Stock Management', path: '/inventory', icon: 'warehouse',
    children: [
      { label: 'Dashboard', path: '/inventory', icon: 'layout-dashboard', permission: 'inventory:view' },
      { label: 'Serials / Keys', path: '/inventory/serials', icon: 'hash' },
      { label: 'Stock In / Out', path: '/inventory/transactions', icon: 'arrow-left-right' },
      { label: 'Stock Transfer', path: '/inventory/transactions/new?type=transfer', icon: 'move' },
      { label: 'Recipes / BOM', path: '/inventory/recipes', icon: 'clipboard-list' },
      { label: 'Production', path: '/inventory/production', icon: 'factory' },
      { label: 'Scrap', path: '/inventory/scrap', icon: 'trash-2' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. BANKING
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Banking', path: '/accounts/banks', icon: 'landmark',
    children: [
      { label: 'Bank Accounts', path: '/accounts/banks', icon: 'landmark', permission: 'accounts:view' },
      { label: 'Bank Reconciliation', path: '/accounts/reconciliation', icon: 'scale' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. COMMUNICATION
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Communication', path: '/communication/templates', icon: 'message-circle',
    children: [
      { label: 'Templates', path: '/communication/templates', icon: 'file-text', permission: 'communication:view' },
      { label: 'Signatures', path: '/communication/signatures', icon: 'edit' },
      { label: 'WhatsApp', path: '/whatsapp', icon: 'message-circle' },
      { label: 'Broadcasts', path: '/whatsapp/broadcasts', icon: 'radio' },
      { label: 'Chatbot', path: '/whatsapp/chatbot', icon: 'bot' },
      { label: 'Email', path: '/settings/email', icon: 'mail' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. TOOLS
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Tools', path: '/workflows', icon: 'wrench',
    children: [
      { label: 'Workflows', path: '/workflows', icon: 'git-branch', permission: 'workflows:view' },
      { label: 'Documents', path: '/documents', icon: 'file-text', permission: 'documents:view' },
      { label: 'Plugin Store', path: '/plugins/catalog', icon: 'zap' },
      { label: 'Installed Plugins', path: '/plugins/installed', icon: 'check-circle' },
      { label: 'Import Profiles', path: '/import/profiles', icon: 'upload' },
      { label: 'Sync', path: '/sync/dashboard', icon: 'refresh-cw' },
      { label: 'Approvals', path: '/approvals', icon: 'check-square' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. SETTINGS
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Settings', path: '/settings', icon: 'settings', permission: 'settings:view',
    children: [
      { label: 'Users', path: '/settings/users', icon: 'users' },
      { label: 'Roles', path: '/settings/roles', icon: 'shield' },
      { label: 'Permissions', path: '/settings/permissions', icon: 'lock' },
      { label: 'Lookups', path: '/settings/lookups', icon: 'list' },
      { label: 'Menus', path: '/settings/menus', icon: 'menu' },
      { label: 'Notification Config', path: '/settings/notification-config', icon: 'bell' },
      { label: 'Data Masking', path: '/settings/data-masking', icon: 'eye-off' },
      { label: 'Keyboard Shortcuts', path: '/settings/shortcuts', icon: 'keyboard' },
      { label: 'Business Types', path: '/settings/business-types', icon: 'briefcase' },
      { label: 'AI Models', path: '/settings/ai', icon: 'cpu' },
      { label: 'Google', path: '/settings/google', icon: 'globe' },
      { label: 'Integrations', path: '/settings/integrations', icon: 'link' },
      { label: 'Subscription', path: '/settings/subscription', icon: 'crown' },
      { label: 'Wallet', path: '/settings/wallet', icon: 'wallet' },
      { label: 'Developer', path: '/settings/developer', icon: 'code' },
      { label: 'Error Logs', path: '/settings/error-logs', icon: 'alert-triangle' },
      { label: 'Verifications', path: '/settings/verifications', icon: 'shield-check' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. SUPPORT
  // ─────────────────────────────────────────────────────────────
  {
    label: 'Support', path: '/support/tickets', icon: 'life-buoy',
    children: [
      { label: 'Tickets', path: '/support/tickets', icon: 'headphones' },
      { label: 'New Ticket', path: '/support/new', icon: 'plus-circle' },
      { label: 'Installations', path: '/post-sales/installations', icon: 'tool' },
      { label: 'Trainings', path: '/post-sales/trainings', icon: 'book-open' },
      {
        label: 'Warranty', path: '/post-sales/warranty', icon: 'shield-check',
        children: [
          { label: 'Warranty Records', path: '/post-sales/warranty', icon: 'shield' },
          { label: 'Warranty Claims', path: '/post-sales/warranty/claims', icon: 'alert-circle' },
          { label: 'Templates', path: '/post-sales/warranty/templates', icon: 'file-text' },
          { label: 'Import Templates', path: '/post-sales/warranty/templates/import', icon: 'download' },
        ],
      },
      {
        label: 'AMC', path: '/post-sales/amc', icon: 'refresh-cw',
        children: [
          { label: 'Contracts', path: '/post-sales/amc', icon: 'file-check' },
          { label: 'AMC Plans', path: '/post-sales/amc/plans', icon: 'list' },
          { label: 'Schedule', path: '/post-sales/amc/schedule', icon: 'calendar' },
        ],
      },
      { label: 'Service Visits', path: '/post-sales/service-visits', icon: 'wrench' },
      { label: 'Renewals', path: '/post-sales/renewals', icon: 'clock' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Software Vendor (admin only)
  // ─────────────────────────────────────────────────────────────
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
      { label: 'Discovery', path: '/admin/discovery', icon: 'search' },
    ],
  },
];
