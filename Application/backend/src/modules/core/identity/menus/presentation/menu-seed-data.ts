import { MenuSeedItem } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';

export const MENU_SEED_DATA: MenuSeedItem[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. DASHBOARD
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Dashboard', code: 'DASHBOARD', icon: 'layout-dashboard', menuType: 'GROUP',
    route: '/dashboard', permissionModule: 'dashboard', permissionAction: 'read',
    children: [
      { name: 'Overview', code: 'DASH_OVERVIEW', icon: 'layout-dashboard', route: '/dashboard', permissionModule: 'dashboard', permissionAction: 'read' },
      { name: 'My Dashboard', code: 'DASH_MY', icon: 'user', route: '/dashboard/my', permissionModule: 'dashboard', permissionAction: 'read' },
      { name: 'Sales Analytics', code: 'DASH_SALES', icon: 'dollar-sign', route: '/analytics?view=sales', permissionModule: 'analytics', permissionAction: 'read' },
      { name: 'Lead Analytics', code: 'DASH_LEADS', icon: 'trending-up', route: '/analytics?view=leads', permissionModule: 'analytics', permissionAction: 'read' },
      { name: 'Revenue Trends', code: 'DASH_REVENUE', icon: 'bar-chart', route: '/analytics?view=revenue', permissionModule: 'analytics', permissionAction: 'read' },
      { name: 'Performance', code: 'DASH_PERFORMANCE', icon: 'activity', route: '/analytics?view=performance', permissionModule: 'performance', permissionAction: 'read' },
      { name: 'KPI Dashboard', code: 'DASH_KPI', icon: 'target', route: '/analytics?view=kpi', permissionModule: 'analytics', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. MIS
  // ─────────────────────────────────────────────────────────────
  {
    name: 'MIS', code: 'MIS', icon: 'bar-chart-3', menuType: 'GROUP',
    route: '/reports', permissionModule: 'reports', permissionAction: 'read',
    children: [
      {
        name: 'BI', code: 'MIS_BI', icon: 'pie-chart', menuType: 'GROUP',
        permissionModule: 'analytics', permissionAction: 'read',
        children: [
          { name: 'All BI', code: 'BI_ALL', icon: 'layout-dashboard', menuType: 'ITEM', route: '/reports', permissionModule: 'reports', permissionAction: 'read' },
        ],
      },
      {
        name: 'Report', code: 'MIS_REPORT', icon: 'file-bar-chart', menuType: 'GROUP',
        permissionModule: 'reports', permissionAction: 'read',
        children: [
          { name: 'Report Designer', code: 'RPT_DESIGNER', icon: 'pen-tool', menuType: 'ITEM', route: '/settings/templates', permissionModule: 'reports', permissionAction: 'read' },
          { name: 'My Reports', code: 'RPT_MY', icon: 'bookmark', menuType: 'ITEM', route: '/reports/saved', permissionModule: 'reports', permissionAction: 'read' },
        ],
      },
      { name: 'Scheduled Reports', code: 'MIS_SCHEDULED', icon: 'clock', menuType: 'ITEM', route: '/reports/scheduled', permissionModule: 'reports', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. CRM
  // ─────────────────────────────────────────────────────────────
  {
    name: 'CRM', code: 'CRM', icon: 'users', menuType: 'GROUP',
    route: '/contacts', permissionModule: 'contacts', permissionAction: 'read',
    children: [
      {
        name: 'Contact Master', code: 'CRM_CONTACT_ROW', icon: 'user-check', menuType: 'GROUP',
        permissionModule: 'contacts', permissionAction: 'read',
        children: [
          { name: 'Dashboard', code: 'CRM_DASH', icon: 'layout-dashboard', menuType: 'ITEM', route: '/contacts/dashboard', permissionModule: 'contacts', permissionAction: 'read' },
          { name: 'All Records', code: 'CRM_ALL_RECORDS', icon: 'list', menuType: 'ITEM', route: '/contacts/all-records', permissionModule: 'contacts', permissionAction: 'read' },
          { name: 'Statistics', code: 'CRM_STATISTICS', icon: 'bar-chart-2', menuType: 'ITEM', route: '/contacts/statistics', permissionModule: 'contacts', permissionAction: 'read' },
          { name: 'Raw Contacts', code: 'CRM_RAW', icon: 'user-plus', menuType: 'ITEM', route: '/raw-contacts', permissionModule: 'raw-contacts', permissionAction: 'read' },
          { name: 'Contacts', code: 'CRM_CONTACTS', icon: 'users', menuType: 'ITEM', route: '/contacts', permissionModule: 'contacts', permissionAction: 'read' },
          { name: 'Organizations', code: 'CRM_ORGS', icon: 'building', menuType: 'ITEM', route: '/organizations', permissionModule: 'organizations', permissionAction: 'read' },
        ],
      },
      { name: 'Leads', code: 'CRM_LEADS', icon: 'trending-up', route: '/leads', permissionModule: 'leads', permissionAction: 'read' },
      { name: 'Activities', code: 'CRM_ACTIVITIES', icon: 'activity', route: '/activities', permissionModule: 'activities', permissionAction: 'read' },
      { name: 'Follow-ups', code: 'CRM_FOLLOWUPS', icon: 'phone', route: '/follow-ups', permissionModule: 'activities', permissionAction: 'read' },
      { name: 'Tour Plans', code: 'CRM_TOUR_PLANS', icon: 'map-pin', route: '/tour-plans', permissionModule: 'activities', permissionAction: 'read' },
      { name: 'Tasks', code: 'CRM_TASKS', icon: 'check-square', route: '/tasks', permissionModule: 'tasks', permissionAction: 'read' },
      { name: 'Calendar', code: 'CRM_CALENDAR', icon: 'calendar', route: '/calendar', permissionModule: 'calendar', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. MASTER — true 3-level: Master → sub-group → leaf items
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Master', code: 'MASTER', icon: 'database', menuType: 'GROUP',
    route: '/master/accounts',
    children: [
      {
        name: 'Accounts Master', code: 'MASTER_ACCOUNTS', icon: 'coins', menuType: 'GROUP',
        route: '/master/accounts', permissionModule: 'accounts', permissionAction: 'read',
        children: [
          { name: 'Ledger', code: 'ACCT_LEDGER', icon: 'book-open', menuType: 'ITEM', route: '/accounts/ledger', permissionModule: 'accounts', permissionAction: 'read' },
          { name: 'Account Groups', code: 'ACCT_GROUPS', icon: 'folder-tree', menuType: 'ITEM', route: '/accounts/groups', permissionModule: 'accounts', permissionAction: 'read' },
          { name: 'Sale Master', code: 'ACCT_SALE_MASTER', icon: 'file-text', menuType: 'ITEM', route: '/accounts/sale', permissionModule: 'accounts', permissionAction: 'read' },
          { name: 'Purchase Master', code: 'ACCT_PURCHASE_MASTER', icon: 'shopping-cart', menuType: 'ITEM', route: '/accounts/purchase', permissionModule: 'accounts', permissionAction: 'read' },
          { name: 'Ledger Mappings', code: 'ACCT_MAPPINGS', icon: 'link', menuType: 'ITEM', route: '/accounts/ledger-mappings', permissionModule: 'accounts', permissionAction: 'read' },
        ],
      },
      {
        name: 'Inventory Master', code: 'MASTER_INVENTORY', icon: 'package', menuType: 'GROUP',
        route: '/master/inventory', permissionModule: 'products', permissionAction: 'read',
        children: [
          { name: 'Items / Products', code: 'INV_ITEMS', icon: 'package', menuType: 'ITEM', route: '/inventory/items', permissionModule: 'products', permissionAction: 'read' },
          { name: 'Store / Warehouse', code: 'INV_STORES', icon: 'warehouse', menuType: 'ITEM', route: '/inventory/stores', permissionModule: 'products', permissionAction: 'read' },
          { name: 'Company / Brand', code: 'INV_COMPANIES', icon: 'building', menuType: 'ITEM', route: '/inventory/companies' },
          { name: 'Item Groups', code: 'INV_GROUPS', icon: 'folder', menuType: 'ITEM', route: '/inventory/groups' },
          { name: 'Units', code: 'INV_UNITS', icon: 'ruler', menuType: 'ITEM', route: '/inventory/units' },
          { name: 'Manufacturers', code: 'INV_MANUFACTURERS', icon: 'factory', menuType: 'ITEM', route: '/inventory/manufacturers' },
        ],
      },
      {
        name: 'Rate Master', code: 'MASTER_RATE', icon: 'tag', menuType: 'GROUP',
        route: '/master/rate',
        children: [
          { name: 'Price Lists', code: 'RATE_PRICELISTS', icon: 'list', menuType: 'ITEM', route: '/pricing/price-lists' },
          { name: 'Price Tiers', code: 'RATE_TIERS', icon: 'layers', menuType: 'ITEM', route: '/pricing/tiers' },
          { name: 'Batch Pricing', code: 'RATE_BATCH', icon: 'database', menuType: 'ITEM', route: '/pricing/batch' },
        ],
      },
      {
        name: 'Discount Master', code: 'MASTER_DISCOUNT', icon: 'percent', menuType: 'GROUP',
        route: '/master/discount',
        children: [
          { name: 'Agency Discount', code: 'DISC_AGENCY', icon: 'tag', menuType: 'ITEM', route: '/discount-master/agency' },
          { name: 'Item Discount', code: 'DISC_ITEM', icon: 'package', menuType: 'ITEM', route: '/discount-master/item' },
          { name: 'Promotions', code: 'DISC_PROMOS', icon: 'gift', menuType: 'ITEM', route: '/promotions' },
        ],
      },
      { name: 'Other Master', code: 'MASTER_OTHER', icon: 'folder', menuType: 'ITEM', route: '/master/other', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Opening Balance', code: 'MASTER_OPBAL', icon: 'scale', menuType: 'ITEM', route: '/master/opening-balance', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Currency', code: 'MASTER_CURRENCY', icon: 'banknote', menuType: 'ITEM', route: '/master/currency' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. SALE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Sale', code: 'SALE', icon: 'indian-rupee', menuType: 'GROUP',
    route: '/quotations', permissionModule: 'sales', permissionAction: 'read',
    children: [
      { name: 'Dashboard', code: 'SALE_DASH', icon: 'layout-dashboard', route: '/sales/dashboard', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Quotations', code: 'SALE_QUOTATIONS', icon: 'file-text', route: '/quotations', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Proforma Invoice', code: 'SALE_PROFORMA', icon: 'file-minus', route: '/sales/proforma', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Sale Orders', code: 'SALE_ORDERS', icon: 'clipboard-list', route: '/sales/orders', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Delivery Challan', code: 'SALE_DELIVERY', icon: 'truck', route: '/sales/delivery-challans', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Sale Invoice', code: 'SALE_INVOICE', icon: 'receipt', route: '/finance/invoices', permissionModule: 'invoices', permissionAction: 'read' },
      { name: 'Sale Returns', code: 'SALE_RETURNS', icon: 'rotate-ccw', route: '/sales/returns', permissionModule: 'sales', permissionAction: 'read' },
      { name: 'Credit Notes', code: 'SALE_CREDIT', icon: 'file-minus', route: '/sales/credit-notes', permissionModule: 'sales', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. PURCHASE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Purchase', code: 'PURCHASE', icon: 'shopping-cart', menuType: 'GROUP',
    route: '/procurement', permissionModule: 'procurement', permissionAction: 'read',
    children: [
      { name: 'Dashboard', code: 'PUR_DASH', icon: 'layout-dashboard', route: '/procurement', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'RFQ', code: 'PUR_RFQ', icon: 'file-question', route: '/procurement/rfq', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Purchase Quotations', code: 'PUR_QUOTATIONS', icon: 'file-text', route: '/procurement/quotations', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Compare Quotations', code: 'PUR_COMPARE', icon: 'git-compare', route: '/procurement/compare', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Purchase Orders', code: 'PUR_ORDERS', icon: 'clipboard-list', route: '/procurement/purchase-orders', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Goods Receipt', code: 'PUR_GRN', icon: 'package-check', route: '/procurement/goods-receipts', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Purchase Invoice', code: 'PUR_INVOICE', icon: 'receipt', route: '/procurement/invoices', permissionModule: 'procurement', permissionAction: 'read' },
      { name: 'Debit Notes', code: 'PUR_DEBIT', icon: 'file-plus', route: '/sales/debit-notes', permissionModule: 'sales', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. ACCOUNTING TRANSACTIONS
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Accounting Trans.', code: 'ACC_TRANS', icon: 'receipt', menuType: 'GROUP',
    route: '/accounts/transactions', permissionModule: 'accounts', permissionAction: 'read',
    children: [
      { name: 'Dashboard', code: 'ACC_DASH', icon: 'layout-dashboard', route: '/accounts/transactions', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Journal Entry', code: 'ACC_JOURNAL', icon: 'book-open', route: '/accounts/journal-entries', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Payment In', code: 'ACC_PAY_IN', icon: 'arrow-down-circle', route: '/accounts/payments?type=receipt', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Payment Out', code: 'ACC_PAY_OUT', icon: 'arrow-up-circle', route: '/accounts/payments?type=payment', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Contra Entry', code: 'ACC_CONTRA', icon: 'arrow-left-right', route: '/accounts/contra', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'TDS Entries', code: 'ACC_TDS', icon: 'percent', route: '/accounts/tds', permissionModule: 'accounts', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. STOCK MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Stock Management', code: 'STOCK_MGMT', icon: 'warehouse', menuType: 'GROUP',
    route: '/inventory', permissionModule: 'inventory', permissionAction: 'read',
    children: [
      { name: 'Dashboard', code: 'STOCK_DASH', icon: 'layout-dashboard', route: '/inventory', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Serials / Keys', code: 'STOCK_SERIALS', icon: 'hash', route: '/inventory/serials', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Stock In / Out', code: 'STOCK_INOUT', icon: 'arrow-left-right', route: '/inventory/transactions', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Stock Transfer', code: 'STOCK_TRANSFER', icon: 'move', route: '/inventory/transactions/new?type=transfer', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Recipes / BOM', code: 'STOCK_RECIPES', icon: 'clipboard-list', route: '/inventory/recipes', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Production', code: 'STOCK_PRODUCTION', icon: 'factory', route: '/inventory/production', permissionModule: 'inventory', permissionAction: 'read' },
      { name: 'Scrap', code: 'STOCK_SCRAP', icon: 'trash-2', route: '/inventory/scrap', permissionModule: 'inventory', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. BANKING
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Banking', code: 'BANKING', icon: 'landmark', menuType: 'GROUP',
    route: '/accounts/banks', permissionModule: 'accounts', permissionAction: 'read',
    children: [
      { name: 'Bank Accounts', code: 'BANK_ACCOUNTS', icon: 'landmark', route: '/accounts/banks', permissionModule: 'accounts', permissionAction: 'read' },
      { name: 'Bank Reconciliation', code: 'BANK_RECON', icon: 'scale', route: '/accounts/reconciliation', permissionModule: 'accounts', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. COMMUNICATION
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Communication', code: 'COMMUNICATION', icon: 'message-circle', menuType: 'GROUP',
    route: '/communication/templates', permissionModule: 'communication', permissionAction: 'read',
    children: [
      { name: 'Templates', code: 'COMM_TEMPLATES', icon: 'file-text', route: '/communication/templates', permissionModule: 'communication', permissionAction: 'read' },
      { name: 'Signatures', code: 'COMM_SIGNATURES', icon: 'edit', route: '/communication/signatures', permissionModule: 'communication', permissionAction: 'read' },
      { name: 'WhatsApp', code: 'COMM_WA', icon: 'message-circle', route: '/whatsapp', permissionModule: 'whatsapp', permissionAction: 'read' },
      { name: 'Broadcasts', code: 'COMM_BROADCASTS', icon: 'radio', route: '/whatsapp/broadcasts', permissionModule: 'whatsapp', permissionAction: 'read' },
      { name: 'Chatbot', code: 'COMM_CHATBOT', icon: 'bot', route: '/whatsapp/chatbot', permissionModule: 'whatsapp', permissionAction: 'read' },
      { name: 'Email', code: 'COMM_EMAIL', icon: 'mail', route: '/settings/email', permissionModule: 'settings', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. TOOLS
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Tools', code: 'TOOLS', icon: 'wrench', menuType: 'GROUP',
    route: '/workflows', permissionModule: 'workflows', permissionAction: 'read',
    children: [
      { name: 'Workflows', code: 'TOOLS_WORKFLOWS', icon: 'git-branch', route: '/workflows', permissionModule: 'workflows', permissionAction: 'read' },
      { name: 'Documents', code: 'TOOLS_DOCS', icon: 'file-text', route: '/documents', permissionModule: 'documents', permissionAction: 'read' },
      { name: 'Plugin Store', code: 'TOOLS_PLUGINS', icon: 'zap', route: '/plugins/catalog', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Installed Plugins', code: 'TOOLS_INSTALLED', icon: 'check-circle', route: '/plugins/installed', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Import Profiles', code: 'TOOLS_IMPORT', icon: 'upload', route: '/import/profiles', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Sync', code: 'TOOLS_SYNC', icon: 'refresh-cw', route: '/sync/dashboard', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Approvals', code: 'TOOLS_APPROVALS', icon: 'check-square', route: '/approvals', permissionModule: 'settings', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // AI HUB
  // ─────────────────────────────────────────────────────────────
  {
    name: 'AI Hub', code: 'AI_HUB', icon: 'brain', menuType: 'GROUP',
    route: '/ai/settings', permissionModule: 'settings', permissionAction: 'read',
    children: [
      { name: 'AI Settings', code: 'AI_SETTINGS', icon: 'settings', route: '/ai/settings', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Training', code: 'AI_TRAINING', icon: 'database', route: '/ai/training', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Chat Test', code: 'AI_CHAT', icon: 'message-square', route: '/ai/chat', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'System Prompts', code: 'AI_PROMPTS', icon: 'terminal', route: '/ai/prompts', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Chat Widget', code: 'AI_WIDGET', icon: 'layout', route: '/ai/widget-config', permissionModule: 'settings', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. MARKETPLACE (Social Commerce Hub)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Market HUB', code: 'MARKETPLACE', icon: 'store', menuType: 'GROUP',
    route: '/marketplace', permissionModule: 'marketplace', permissionAction: 'read',
    children: [
      { name: 'Market Feed', code: 'MP_FEED', icon: 'activity', route: '/marketplace/feed', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Dashboard', code: 'MP_DASHBOARD', icon: 'layout-dashboard', route: '/marketplace', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Listings', code: 'MP_LISTINGS', icon: 'list', route: '/marketplace/listings', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Posts & Feed', code: 'MP_POSTS', icon: 'rss', route: '/marketplace/posts', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Offers', code: 'MP_OFFERS', icon: 'tag', route: '/marketplace/offers', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Enquiries', code: 'MP_ENQUIRIES', icon: 'mail', route: '/marketplace/enquiries', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Requirements', code: 'MP_REQUIREMENTS', icon: 'file-search', route: '/marketplace/requirements', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Reviews', code: 'MP_REVIEWS', icon: 'star', route: '/marketplace/reviews', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Analytics', code: 'MP_ANALYTICS', icon: 'bar-chart-2', route: '/marketplace/analytics', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Installed Modules', code: 'MP_MODULES', icon: 'package', route: '/marketplace/modules', permissionModule: 'marketplace', permissionAction: 'read' },
      { name: 'Vendor Portal', code: 'MP_VENDOR', icon: 'briefcase', route: '/marketplace/vendor', permissionModule: 'marketplace', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. SETTINGS
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Settings', code: 'SETTINGS', icon: 'settings', menuType: 'GROUP',
    route: '/settings', permissionModule: 'settings', permissionAction: 'read',
    children: [
      { name: 'Control Room', code: 'SET_CONTROL_ROOM', icon: 'sliders', route: '/settings/control-room', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Users', code: 'SET_USERS', icon: 'users', route: '/settings/users', permissionModule: 'users', permissionAction: 'read' },
      { name: 'Roles', code: 'SET_ROLES', icon: 'shield', route: '/settings/roles', permissionModule: 'roles', permissionAction: 'read' },
      { name: 'Permissions', code: 'SET_PERMS', icon: 'lock', route: '/settings/permissions', permissionModule: 'roles', permissionAction: 'read' },
      { name: 'Lookups', code: 'SET_LOOKUPS', icon: 'list', route: '/settings/lookups', permissionModule: 'lookups', permissionAction: 'read' },
      { name: 'Menus', code: 'SET_MENUS', icon: 'menu', route: '/settings/menus', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Notification Config', code: 'SET_NOTIF', icon: 'bell', route: '/settings/notification-config', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Data Masking', code: 'SET_MASKING', icon: 'eye-off', route: '/settings/data-masking', permissionModule: 'settings', permissionAction: 'read' },
      {
        name: 'Customer Portal', code: 'SET_CUSTOMER_PORTAL', icon: 'globe', route: '/settings/customer-portal', permissionModule: 'settings', permissionAction: 'read',
        children: [
          { name: 'Dashboard',       code: 'SET_CP_DASHBOARD',  icon: 'layout-dashboard', route: '/settings/customer-portal',                permissionModule: 'settings', permissionAction: 'read' },
          { name: 'Activation',      code: 'SET_CP_ACTIVATION', icon: 'unlock',           route: '/settings/customer-portal/activation',      permissionModule: 'settings', permissionAction: 'read' },
          { name: 'Users',           code: 'SET_CP_USERS',      icon: 'users',            route: '/settings/customer-portal/users',            permissionModule: 'settings', permissionAction: 'read' },
          { name: 'Menu Categories', code: 'SET_CP_MENUS',      icon: 'layout-list',      route: '/settings/customer-portal/menu-categories',  permissionModule: 'settings', permissionAction: 'read' },
        ],
      },
      { name: 'Business Types', code: 'SET_BIZ_TYPES', icon: 'briefcase', route: '/settings/business-types', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'AI Models', code: 'SET_AI', icon: 'cpu', route: '/settings/ai', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Google', code: 'SET_GOOGLE', icon: 'globe', route: '/settings/google', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Integrations', code: 'SET_INTEGRATIONS', icon: 'link', route: '/settings/integrations', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Subscription', code: 'SET_SUB', icon: 'crown', route: '/settings/subscription', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Wallet', code: 'SET_WALLET', icon: 'wallet', route: '/settings/wallet', permissionModule: 'wallet', permissionAction: 'read' },
      { name: 'Developer', code: 'SET_DEV', icon: 'code', route: '/settings/developer', permissionModule: 'settings', permissionAction: 'read' },
      { name: 'Error Logs', code: 'SET_ERRORS', icon: 'alert-triangle', route: '/settings/error-logs', permissionModule: 'settings', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. SUPPORT
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Support', code: 'SUPPORT', icon: 'life-buoy', menuType: 'GROUP',
    route: '/support/tickets', permissionModule: 'support-tickets', permissionAction: 'read',
    children: [
      { name: 'Tickets', code: 'SUP_TICKETS', icon: 'headphones', route: '/support/tickets', permissionModule: 'support-tickets', permissionAction: 'read' },
      { name: 'New Ticket', code: 'SUP_NEW', icon: 'plus-circle', route: '/support/new', permissionModule: 'support-tickets', permissionAction: 'read' },
      { name: 'Post-Sales', code: 'SUP_POSTSALES', icon: 'tool', route: '/post-sales/installations', permissionModule: 'installations', permissionAction: 'read' },
      { name: 'Trainings', code: 'SUP_TRAINING', icon: 'book-open', route: '/post-sales/trainings', permissionModule: 'trainings', permissionAction: 'read' },
      { name: 'Warranty Records', code: 'SUP_WARRANTY_RECORDS', icon: 'shield-check', route: '/post-sales/warranty', permissionModule: 'warranty', permissionAction: 'read' },
      { name: 'Warranty Claims', code: 'SUP_WARRANTY_CLAIMS', icon: 'alert-triangle', route: '/post-sales/warranty/claims', permissionModule: 'warranty', permissionAction: 'read' },
      { name: 'Warranty Templates', code: 'SUP_WARRANTY_TEMPLATES', icon: 'file-text', route: '/post-sales/warranty/templates', permissionModule: 'warranty', permissionAction: 'read' },
      { name: 'AMC Contracts', code: 'SUP_AMC_CONTRACTS', icon: 'file-check', route: '/post-sales/amc', permissionModule: 'amc', permissionAction: 'read' },
      { name: 'AMC Plans', code: 'SUP_AMC_PLANS', icon: 'layers', route: '/post-sales/amc/plans', permissionModule: 'amc', permissionAction: 'read' },
      { name: 'AMC Schedules', code: 'SUP_AMC_SCHEDULES', icon: 'calendar', route: '/post-sales/amc/schedule', permissionModule: 'amc', permissionAction: 'read' },
      { name: 'Service Visits', code: 'SUP_SERVICE_VISITS', icon: 'truck', route: '/post-sales/service-visits', permissionModule: 'service-visits', permissionAction: 'read' },
      { name: 'Renewals', code: 'SUP_RENEWALS', icon: 'clock', route: '/post-sales/renewals', permissionModule: 'warranty', permissionAction: 'read' },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Software Vendor (admin only)
  // ─────────────────────────────────────────────────────────────
  {
    name: 'Software Vendor', code: 'VENDOR_ADMIN', icon: 'shield', menuType: 'GROUP',
    route: '/admin/vendor', permissionModule: 'admin', permissionAction: 'read',
    children: [
      { name: 'Vendor Dashboard', code: 'VA_DASH', icon: 'bar-chart-2', route: '/admin/vendor', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Plans', code: 'VA_PLANS', icon: 'crown', route: '/admin/plans', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Tenants', code: 'VA_TENANTS', icon: 'building-2', route: '/admin/tenants', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Licenses', code: 'VA_LICENSES', icon: 'key', route: '/admin/licenses', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Offers', code: 'VA_OFFERS', icon: 'gift', route: '/admin/offers', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Modules', code: 'VA_MODULES', icon: 'layers', route: '/admin/modules', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Recharge Plans', code: 'VA_RECHARGE', icon: 'credit-card', route: '/admin/recharge-plans', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Coupons', code: 'VA_COUPONS', icon: 'tag', route: '/admin/coupons', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Service Rates', code: 'VA_RATES', icon: 'zap', route: '/admin/service-rates', permissionModule: 'admin', permissionAction: 'read' },
      { name: 'Wallet Analytics', code: 'VA_WALLET', icon: 'bar-chart', route: '/admin/wallet', permissionModule: 'admin', permissionAction: 'read' },
    ],
  },
];
