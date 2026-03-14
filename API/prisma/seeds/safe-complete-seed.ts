import { PrismaClient } from '@prisma/client';

/**
 * Safe complete seed — CHECK FIRST → INSERT ONLY IF NOT EXISTS → NEVER OVERWRITE
 * Adds: new menu items (Support, Error Logs), PageRegistry entries,
 *       ErrorAutoReportRules, sample ErrorLogs, sample SupportTickets
 */
export async function safeCompleteSeed(prisma: PrismaClient) {
  console.log('\n🌱 Starting SAFE seed (zero duplicates)...\n');

  const stats = {
    menus: { existed: 0, created: 0 },
    pages: { existed: 0, created: 0 },
    errorRules: { existed: 0, created: 0 },
    errors: { existed: 0, created: 0 },
    tickets: { existed: 0, created: 0 },
  };

  // ═══════════════════════════════════════════════════════════
  // Resolve default tenant (menus are tenant-scoped)
  // ═══════════════════════════════════════════════════════════
  const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (!defaultTenant) {
    console.log('⚠️  No default tenant found — skipping safe seed.');
    return;
  }
  const tenantId = defaultTenant.id;

  // ═══════════════════════════════════════════════════════════
  // HELPER: Safe insert menu by [tenantId, code] unique
  // ═══════════════════════════════════════════════════════════
  async function safeInsertMenu(data: {
    code: string;
    name: string;
    icon?: string | null;
    route?: string | null;
    menuType?: string;
    sortOrder?: number;
    parentId?: string | null;
    permissionModule?: string | null;
    permissionAction?: string | null;
  }) {
    const exists = await prisma.menu.findFirst({
      where: { tenantId, code: data.code },
    });
    if (exists) {
      stats.menus.existed++;
      return exists;
    }
    const created = await prisma.menu.create({
      data: {
        tenantId,
        code: data.code,
        name: data.name,
        icon: data.icon ?? null,
        route: data.route ?? null,
        menuType: data.menuType ?? 'ITEM',
        sortOrder: data.sortOrder ?? 0,
        parentId: data.parentId ?? null,
        permissionModule: data.permissionModule ?? null,
        permissionAction: data.permissionAction ?? null,
        isActive: true,
      },
    });
    stats.menus.created++;
    console.log(`  ✅ Menu created: ${data.code} → ${data.name}`);
    return created;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: Safe insert page by routePath unique
  // ═══════════════════════════════════════════════════════════
  async function safeInsertPage(data: {
    routePath: string;
    routePattern: string;
    portal: string;
    filePath: string;
    friendlyName: string;
    pageType: string;
    category: string;
    moduleCode?: string | null;
    showInMenu?: boolean;
    hasParams?: boolean;
    paramNames?: string[];
  }) {
    const exists = await prisma.pageRegistry.findFirst({
      where: { routePath: data.routePath },
    });
    if (exists) {
      stats.pages.existed++;
      return exists;
    }
    const created = await prisma.pageRegistry.create({
      data: {
        routePath: data.routePath,
        routePattern: data.routePattern,
        portal: data.portal,
        filePath: data.filePath,
        friendlyName: data.friendlyName,
        pageType: data.pageType,
        category: data.category,
        moduleCode: data.moduleCode ?? null,
        showInMenu: data.showInMenu ?? !data.routePath.includes(':'),
        hasParams: data.hasParams ?? data.routePath.includes(':'),
        paramNames: data.paramNames ?? [],
        isActive: true,
        isAutoDiscovered: false,
      },
    });
    stats.pages.created++;
    console.log(`  ✅ Page created: ${data.routePath} → ${data.friendlyName}`);
    return created;
  }

  // ═══════════════════════════════════════════════════════════
  // PART 1: ADD MISSING CRM MENUS (Support + Error Logs)
  // ═══════════════════════════════════════════════════════════
  console.log('📋 CRM Portal — new menu items...');

  // ═══════════════════════════════════════════════════════════
  // MIS GROUP (replaces old DASHBOARD + REPORTS_GROUP)
  // ═══════════════════════════════════════════════════════════
  console.log('📊 MIS menu group...');

  const misGroup = await safeInsertMenu({
    code: 'MIS_GROUP',
    name: 'MIS',
    icon: 'bar-chart-3',
    menuType: 'GROUP',
    sortOrder: 0,
  });

  // BI section title
  await safeInsertMenu({
    code: 'MIS_BI_SECTION',
    name: 'BI',
    menuType: 'TITLE',
    sortOrder: 0,
    parentId: misGroup.id,
  });

  await safeInsertMenu({
    code: 'MIS_BI_OVERVIEW',
    name: 'Overview Dashboard',
    icon: 'home',
    route: '/dashboard',
    sortOrder: 1,
    parentId: misGroup.id,
    permissionModule: 'dashboard',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_BI_MY_DASHBOARD',
    name: 'My Dashboard',
    icon: 'user',
    route: '/dashboard/my',
    sortOrder: 2,
    parentId: misGroup.id,
    permissionModule: 'dashboard',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_BI_SALES',
    name: 'Sales Analytics',
    icon: 'dollar-sign',
    route: '/analytics?view=sales',
    sortOrder: 3,
    parentId: misGroup.id,
    permissionModule: 'analytics',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_BI_LEADS',
    name: 'Lead Analytics',
    icon: 'trending-up',
    route: '/analytics?view=leads',
    sortOrder: 4,
    parentId: misGroup.id,
    permissionModule: 'analytics',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_BI_REVENUE',
    name: 'Revenue Trends',
    icon: 'bar-chart',
    route: '/analytics?view=revenue',
    sortOrder: 5,
    parentId: misGroup.id,
    permissionModule: 'analytics',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_BI_PERFORMANCE',
    name: 'Performance',
    icon: 'activity',
    route: '/analytics?view=performance',
    sortOrder: 6,
    parentId: misGroup.id,
    permissionModule: 'performance',
    permissionAction: 'read',
  });

  // Reports section title
  await safeInsertMenu({
    code: 'MIS_REPORTS_SECTION',
    name: 'Reports',
    menuType: 'TITLE',
    sortOrder: 7,
    parentId: misGroup.id,
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_ALL',
    name: 'All Reports',
    icon: 'bar-chart',
    route: '/reports',
    sortOrder: 8,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_SALES',
    name: 'Sales Reports',
    icon: 'dollar-sign',
    route: '/reports?category=SALES',
    sortOrder: 9,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_LEADS',
    name: 'Lead Reports',
    icon: 'trending-up',
    route: '/reports?category=LEAD',
    sortOrder: 10,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_CONTACTS',
    name: 'Contact & Org',
    icon: 'users',
    route: '/reports?category=CONTACT_ORG',
    sortOrder: 11,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_ACTIVITIES',
    name: 'Activity Reports',
    icon: 'activity',
    route: '/reports?category=ACTIVITY',
    sortOrder: 12,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_DEMOS',
    name: 'Demo Reports',
    icon: 'monitor',
    route: '/reports?category=DEMO',
    sortOrder: 13,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_QUOTATIONS',
    name: 'Quotation Reports',
    icon: 'file-text',
    route: '/reports?category=QUOTATION',
    sortOrder: 14,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_TOUR_PLANS',
    name: 'Tour Plan Reports',
    icon: 'map',
    route: '/reports?category=TOUR_PLAN',
    sortOrder: 15,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_TEAM',
    name: 'Team Reports',
    icon: 'user-check',
    route: '/reports?category=TEAM',
    sortOrder: 16,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_COMMUNICATION',
    name: 'Communication',
    icon: 'mail',
    route: '/reports?category=COMMUNICATION',
    sortOrder: 17,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_EXECUTIVE',
    name: 'Executive Reports',
    icon: 'briefcase',
    route: '/reports?category=EXECUTIVE',
    sortOrder: 18,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_CUSTOM',
    name: 'Custom Reports',
    icon: 'sliders',
    route: '/reports?category=CUSTOM',
    sortOrder: 19,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'MIS_REPORTS_DESIGNER',
    name: 'Report Designer',
    icon: 'layout',
    route: '/reports/designer',
    sortOrder: 20,
    parentId: misGroup.id,
    permissionModule: 'reports',
    permissionAction: 'create',
  });

  // Find existing Settings group to attach Error Logs + Audit under it
  const settingsGroup = await prisma.menu.findFirst({
    where: { tenantId, code: 'SETTINGS_GROUP' },
  });

  if (settingsGroup) {
    // Error Logs under Settings (sortOrder high to be near end)
    await safeInsertMenu({
      code: 'SETTINGS_ERROR_LOGS',
      name: 'Error Logs',
      icon: 'alert-triangle',
      route: '/settings/error-logs',
      sortOrder: 20,
      parentId: settingsGroup.id,
      permissionModule: 'settings',
      permissionAction: 'read',
    });

    // Notification Config under Settings
    await safeInsertMenu({
      code: 'SETTINGS_NOTIFICATION_CONFIG',
      name: 'Notification Config',
      icon: 'bell',
      route: '/settings/notification-config',
      sortOrder: 21,
      parentId: settingsGroup.id,
      permissionModule: 'settings',
      permissionAction: 'read',
    });
  }

  // Support GROUP (top-level, before Settings)
  const supportGroup = await safeInsertMenu({
    code: 'SUPPORT_GROUP',
    name: 'Support',
    icon: 'life-buoy',
    menuType: 'GROUP',
    sortOrder: 85,
    permissionModule: 'support-tickets',
    permissionAction: 'read',
  });

  // Support children
  await safeInsertMenu({
    code: 'SUPPORT_MY_TICKETS',
    name: 'My Tickets',
    icon: 'ticket',
    route: '/support/tickets',
    sortOrder: 0,
    parentId: supportGroup.id,
    permissionModule: 'support-tickets',
    permissionAction: 'read',
  });

  await safeInsertMenu({
    code: 'SUPPORT_NEW_TICKET',
    name: 'Report a Problem',
    icon: 'alert-circle',
    route: '/support/new',
    sortOrder: 1,
    parentId: supportGroup.id,
    permissionModule: 'support-tickets',
    permissionAction: 'create',
  });

  // ═══════════════════════════════════════════════════════════
  // PART 2: VENDOR PORTAL MENUS
  // These appear under the SOFTWARE_VENDOR_GROUP in the CRM panel
  // (Vendor panel uses its own auto-menu from API routes)
  // ═══════════════════════════════════════════════════════════
  console.log('📋 Vendor Portal — new menu items...');

  const vendorGroup = await prisma.menu.findFirst({
    where: { tenantId, code: 'SOFTWARE_VENDOR_GROUP' },
  });

  if (vendorGroup) {
    // Error Logs (vendor)
    await safeInsertMenu({
      code: 'SV_ERROR_LOGS',
      name: 'Error Logs',
      icon: 'alert-triangle',
      route: '/admin/error-logs',
      sortOrder: 20,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // System Health (vendor)
    await safeInsertMenu({
      code: 'SV_SYSTEM_HEALTH',
      name: 'System Health',
      icon: 'activity',
      route: '/admin/system-health',
      sortOrder: 21,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Support Tickets (vendor)
    await safeInsertMenu({
      code: 'SV_SUPPORT',
      name: 'Support Tickets',
      icon: 'life-buoy',
      route: '/admin/support',
      sortOrder: 22,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Audit Logs (vendor)
    await safeInsertMenu({
      code: 'SV_AUDIT_LOGS',
      name: 'Audit Logs',
      icon: 'scroll',
      route: '/admin/audit-logs',
      sortOrder: 23,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Packages (vendor)
    await safeInsertMenu({
      code: 'SV_PACKAGES',
      name: 'Packages',
      icon: 'box',
      route: '/admin/packages',
      sortOrder: 11,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Partners (vendor)
    await safeInsertMenu({
      code: 'SV_PARTNERS',
      name: 'Partners',
      icon: 'handshake',
      route: '/admin/partners',
      sortOrder: 12,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Industries (vendor)
    await safeInsertMenu({
      code: 'SV_INDUSTRIES',
      name: 'Industries',
      icon: 'factory',
      route: '/admin/industries',
      sortOrder: 13,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Page Registry (vendor)
    await safeInsertMenu({
      code: 'SV_PAGE_REGISTRY',
      name: 'Page Registry',
      icon: 'file-search',
      route: '/admin/page-registry',
      sortOrder: 14,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Versions (vendor)
    await safeInsertMenu({
      code: 'SV_VERSIONS',
      name: 'Versions',
      icon: 'git-branch',
      route: '/admin/versions',
      sortOrder: 15,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Document Templates (vendor)
    await safeInsertMenu({
      code: 'SV_TEMPLATES',
      name: 'Document Templates',
      icon: 'layout',
      route: '/admin/templates',
      sortOrder: 16,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Dev Requests (vendor)
    await safeInsertMenu({
      code: 'SV_DEV_REQUESTS',
      name: 'Dev Requests',
      icon: 'git-pull-request',
      route: '/admin/dev-requests',
      sortOrder: 24,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // DB Admin (vendor)
    await safeInsertMenu({
      code: 'SV_DB_ADMIN',
      name: 'DB Admin',
      icon: 'database',
      route: '/admin/db-admin',
      sortOrder: 25,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Inventory Labels (vendor)
    await safeInsertMenu({
      code: 'SV_INVENTORY_LABELS',
      name: 'Inventory Labels',
      icon: 'tag',
      route: '/admin/inventory-labels',
      sortOrder: 17,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // AI Tokens (vendor)
    await safeInsertMenu({
      code: 'SV_AI_TOKENS',
      name: 'AI Tokens',
      icon: 'cpu',
      route: '/admin/ai-tokens',
      sortOrder: 26,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });

    // Webhooks (vendor)
    await safeInsertMenu({
      code: 'SV_WEBHOOKS',
      name: 'Webhooks',
      icon: 'webhook',
      route: '/admin/webhooks',
      sortOrder: 27,
      parentId: vendorGroup.id,
      permissionModule: 'admin',
      permissionAction: 'read',
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PART 3: PAGE REGISTRY — All pages for both portals
  // ═══════════════════════════════════════════════════════════
  console.log('📄 Page Registry...');

  const crmPages = [
    // Support (CRM)
    { routePath: '/support/tickets', friendlyName: 'My Support Tickets', pageType: 'LIST', category: 'Support', filePath: 'src/app/(main)/support/tickets/page.tsx' },
    { routePath: '/support/new', friendlyName: 'Report a Problem', pageType: 'CREATE', category: 'Support', filePath: 'src/app/(main)/support/new/page.tsx' },
    { routePath: '/support/tickets/:id', friendlyName: 'Ticket Detail', pageType: 'DETAIL', category: 'Support', filePath: 'src/app/(main)/support/tickets/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    // Error Logs (CRM)
    { routePath: '/settings/error-logs', friendlyName: 'Error Logs', pageType: 'LIST', category: 'Settings', filePath: 'src/app/(main)/settings/error-logs/page.tsx' },
    // Dashboard variants
    { routePath: '/dashboard', friendlyName: 'Dashboard', pageType: 'DASHBOARD', category: 'Dashboard', filePath: 'src/app/(main)/dashboard/page.tsx' },
    { routePath: '/dashboard/my', friendlyName: 'My Dashboard', pageType: 'DASHBOARD', category: 'Dashboard', filePath: 'src/app/(main)/dashboard/my/page.tsx' },
    // Analytics
    { routePath: '/analytics', friendlyName: 'Analytics', pageType: 'DASHBOARD', category: 'Analytics', filePath: 'src/app/(main)/analytics/page.tsx' },
    // Document Templates
    { routePath: '/settings/templates', friendlyName: 'Document Templates', pageType: 'LIST', category: 'Settings', moduleCode: 'document_templates', filePath: 'src/app/(main)/settings/templates/page.tsx' },
    // Notification Config
    { routePath: '/settings/notification-config', friendlyName: 'Notification Config', pageType: 'LIST', category: 'Settings', filePath: 'src/app/(main)/settings/notification-config/page.tsx' },
    // Marketplace
    { routePath: '/marketplace', friendlyName: 'Marketplace', pageType: 'LIST', category: 'Marketplace', filePath: 'src/app/(main)/marketplace/page.tsx' },
    { routePath: '/marketplace/my-offers', friendlyName: 'My Offers', pageType: 'LIST', category: 'Marketplace', filePath: 'src/app/(main)/marketplace/my-offers/page.tsx' },
    { routePath: '/marketplace/my-applications', friendlyName: 'My Applications', pageType: 'LIST', category: 'Marketplace', filePath: 'src/app/(main)/marketplace/my-applications/page.tsx' },
    // Workflows visual
    { routePath: '/workflows', friendlyName: 'Workflows', pageType: 'LIST', category: 'Operations', moduleCode: 'workflows', filePath: 'src/app/(main)/workflows/page.tsx' },
    { routePath: '/workflows/:id/visual', friendlyName: 'Workflow Visual Editor', pageType: 'EDIT', category: 'Operations', moduleCode: 'workflows', filePath: 'src/app/(main)/workflows/[id]/visual/page.tsx', hasParams: true, paramNames: ['id'] },
    // Plugins
    { routePath: '/plugins/catalog', friendlyName: 'Plugin Store', pageType: 'LIST', category: 'Plugins', filePath: 'src/app/(main)/plugins/catalog/page.tsx' },
    { routePath: '/plugins/installed', friendlyName: 'Installed Plugins', pageType: 'LIST', category: 'Plugins', filePath: 'src/app/(main)/plugins/installed/page.tsx' },
    { routePath: '/plugins/:code', friendlyName: 'Plugin Detail', pageType: 'DETAIL', category: 'Plugins', filePath: 'src/app/(main)/plugins/[code]/page.tsx', hasParams: true, paramNames: ['code'] },
    // Import profiles
    { routePath: '/import/profiles', friendlyName: 'Import Profiles', pageType: 'LIST', category: 'Data', filePath: 'src/app/(main)/import/profiles/page.tsx' },
    // Reports
    { routePath: '/reports', friendlyName: 'All Reports', pageType: 'LIST', category: 'MIS', moduleCode: 'reports', filePath: 'src/app/(main)/reports/page.tsx' },
    { routePath: '/reports/designer', friendlyName: 'Report Designer', pageType: 'CREATE', category: 'MIS', moduleCode: 'reports', filePath: 'src/app/(main)/reports/designer/page.tsx' },
    // Settings (additional)
    { routePath: '/settings/audit-logs', friendlyName: 'Audit Logs', pageType: 'LIST', category: 'Settings', filePath: 'src/app/(main)/settings/audit-logs/page.tsx' },
    // Inventory (CRM)
    { routePath: '/inventory', friendlyName: 'Inventory Dashboard', pageType: 'DASHBOARD', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/page.tsx' },
    { routePath: '/inventory/serials', friendlyName: 'Serial / Key List', pageType: 'LIST', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/serials/page.tsx' },
    { routePath: '/inventory/serials/new', friendlyName: 'Add Serial / Key', pageType: 'CREATE', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/serials/new/page.tsx' },
    { routePath: '/inventory/serials/:id', friendlyName: 'Serial Detail', pageType: 'DETAIL', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/serials/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    { routePath: '/inventory/serials/bulk-import', friendlyName: 'Bulk Import Serials', pageType: 'CREATE', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/serials/bulk-import/page.tsx' },
    { routePath: '/inventory/transactions', friendlyName: 'Stock Transactions', pageType: 'LIST', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/transactions/page.tsx' },
    { routePath: '/inventory/transactions/new', friendlyName: 'Record Stock Movement', pageType: 'CREATE', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/transactions/new/page.tsx' },
    { routePath: '/inventory/locations', friendlyName: 'Stock Locations', pageType: 'LIST', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/locations/page.tsx' },
    { routePath: '/inventory/adjustments', friendlyName: 'Stock Adjustments', pageType: 'LIST', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/adjustments/page.tsx' },
    { routePath: '/inventory/reports', friendlyName: 'Inventory Reports', pageType: 'LIST', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/reports/page.tsx' },
    { routePath: '/inventory/reports/ledger', friendlyName: 'Stock Ledger', pageType: 'REPORT', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/reports/ledger/page.tsx' },
    { routePath: '/inventory/reports/expiry', friendlyName: 'Expiry Report', pageType: 'REPORT', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/reports/expiry/page.tsx' },
    { routePath: '/inventory/reports/valuation', friendlyName: 'Stock Valuation', pageType: 'REPORT', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/reports/valuation/page.tsx' },
    { routePath: '/inventory/reports/serial-tracking', friendlyName: 'Serial Tracking', pageType: 'REPORT', category: 'Inventory', moduleCode: 'inventory', filePath: 'src/app/(main)/inventory/reports/serial-tracking/page.tsx' },
    // Product sub-pages
    { routePath: '/products/categories', friendlyName: 'Product Categories', pageType: 'LIST', category: 'Products', moduleCode: 'products', filePath: 'src/app/(main)/products/categories/page.tsx' },
    { routePath: '/products/brands', friendlyName: 'Brands', pageType: 'LIST', category: 'Products', moduleCode: 'products', filePath: 'src/app/(main)/products/brands/page.tsx' },
    { routePath: '/products/manufacturers', friendlyName: 'Manufacturers', pageType: 'LIST', category: 'Products', moduleCode: 'products', filePath: 'src/app/(main)/products/manufacturers/page.tsx' },
    { routePath: '/products/units', friendlyName: 'Units', pageType: 'LIST', category: 'Products', moduleCode: 'products', filePath: 'src/app/(main)/products/units/page.tsx' },
    { routePath: '/products/packages', friendlyName: 'Packaging', pageType: 'LIST', category: 'Products', moduleCode: 'products', filePath: 'src/app/(main)/products/packages/page.tsx' },
  ];

  const vendorPages = [
    // Vendor Dashboard
    { routePath: '/vendor-dashboard', friendlyName: 'Vendor Dashboard', pageType: 'DASHBOARD', category: 'Vendor', filePath: 'src/app/(dashboard)/vendor-dashboard/page.tsx' },
    // Error Logs (Vendor)
    { routePath: '/error-logs', friendlyName: 'Error Logs Dashboard', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/error-logs/page.tsx' },
    { routePath: '/error-logs/:traceId', friendlyName: 'Error Log Detail', pageType: 'DETAIL', category: 'Dev Ops', filePath: 'src/app/(dashboard)/error-logs/[traceId]/page.tsx', hasParams: true, paramNames: ['traceId'] },
    // Support (Vendor)
    { routePath: '/support', friendlyName: 'Support Dashboard', pageType: 'LIST', category: 'Support', filePath: 'src/app/(dashboard)/support/page.tsx' },
    { routePath: '/support/:id', friendlyName: 'Support Ticket Detail', pageType: 'DETAIL', category: 'Support', filePath: 'src/app/(dashboard)/support/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    // Tenants
    { routePath: '/tenants', friendlyName: 'Tenants', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/tenants/page.tsx' },
    { routePath: '/tenants/:id', friendlyName: 'Tenant Detail', pageType: 'DETAIL', category: 'Vendor', filePath: 'src/app/(dashboard)/tenants/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    { routePath: '/tenants/:id/audit', friendlyName: 'Tenant Audit Stream', pageType: 'DETAIL', category: 'Dev Ops', filePath: 'src/app/(dashboard)/tenants/[id]/audit/page.tsx', hasParams: true, paramNames: ['id'] },
    { routePath: '/tenants/:id/audit/report', friendlyName: 'Audit Report', pageType: 'DETAIL', category: 'Dev Ops', filePath: 'src/app/(dashboard)/tenants/[id]/audit/report/page.tsx', hasParams: true, paramNames: ['id'] },
    // Plans
    { routePath: '/plans', friendlyName: 'Subscription Plans', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/plans/page.tsx' },
    // Licenses
    { routePath: '/licenses', friendlyName: 'Licenses', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/licenses/page.tsx' },
    // Offers
    { routePath: '/offers', friendlyName: 'Software Offers', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/offers/page.tsx' },
    // Modules
    { routePath: '/modules', friendlyName: 'Module Registry', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/modules/page.tsx' },
    // Packages
    { routePath: '/packages', friendlyName: 'Subscription Packages', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/packages/page.tsx' },
    // Partners
    { routePath: '/partners', friendlyName: 'Partners', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/partners/page.tsx' },
    // Industries
    { routePath: '/industries', friendlyName: 'Industry Management', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/industries/page.tsx' },
    // Versions
    { routePath: '/versions', friendlyName: 'Version Management', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/versions/page.tsx' },
    { routePath: '/versions/:id', friendlyName: 'Version Detail', pageType: 'DETAIL', category: 'Dev Ops', filePath: 'src/app/(dashboard)/versions/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    // Templates (vendor)
    { routePath: '/templates', friendlyName: 'Document Templates', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/templates/page.tsx' },
    { routePath: '/templates/new', friendlyName: 'Create Template', pageType: 'CREATE', category: 'Vendor', filePath: 'src/app/(dashboard)/templates/new/page.tsx' },
    { routePath: '/templates/:id', friendlyName: 'Edit Template', pageType: 'EDIT', category: 'Vendor', filePath: 'src/app/(dashboard)/templates/[id]/page.tsx', hasParams: true, paramNames: ['id'] },
    // Page Registry
    { routePath: '/page-registry', friendlyName: 'Page Registry', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/page-registry/page.tsx' },
    // Module Builder
    { routePath: '/module-builder', friendlyName: 'Module Builder', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/module-builder/page.tsx' },
    // System Health
    { routePath: '/system-health', friendlyName: 'System Health', pageType: 'DASHBOARD', category: 'Dev Ops', filePath: 'src/app/(dashboard)/system-health/page.tsx' },
    // Audit Logs (vendor)
    { routePath: '/audit-logs', friendlyName: 'Audit Logs', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/audit-logs/page.tsx' },
    // Dev Requests
    { routePath: '/dev-requests', friendlyName: 'Dev Requests', pageType: 'LIST', category: 'Dev Ops', filePath: 'src/app/(dashboard)/dev-requests/page.tsx' },
    // DB Admin
    { routePath: '/db-admin', friendlyName: 'DB Admin', pageType: 'DASHBOARD', category: 'Dev Ops', filePath: 'src/app/(dashboard)/db-admin/page.tsx' },
    // AI Tokens
    { routePath: '/ai-tokens', friendlyName: 'AI Tokens', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/ai-tokens/page.tsx' },
    // Webhooks
    { routePath: '/webhooks', friendlyName: 'Webhooks', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/webhooks/page.tsx' },
    // Wallet
    { routePath: '/wallet', friendlyName: 'Wallet', pageType: 'DASHBOARD', category: 'Vendor', filePath: 'src/app/(dashboard)/wallet/page.tsx' },
    // Wallet Analytics
    { routePath: '/wallet-analytics', friendlyName: 'Wallet Analytics', pageType: 'DASHBOARD', category: 'Vendor', filePath: 'src/app/(dashboard)/wallet-analytics/page.tsx' },
    // Recharge Plans
    { routePath: '/recharge-plans', friendlyName: 'Recharge Plans', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/recharge-plans/page.tsx' },
    // Service Rates
    { routePath: '/service-rates', friendlyName: 'Service Rates', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/service-rates/page.tsx' },
    // Coupons
    { routePath: '/coupons', friendlyName: 'Coupons', pageType: 'LIST', category: 'Vendor', filePath: 'src/app/(dashboard)/coupons/page.tsx' },
    // Subscription Analytics
    { routePath: '/subscription-analytics', friendlyName: 'Subscription Analytics', pageType: 'DASHBOARD', category: 'Vendor', filePath: 'src/app/(dashboard)/subscription-analytics/page.tsx' },
    // Inventory Labels (Vendor)
    { routePath: '/inventory-labels', friendlyName: 'Inventory Labels', pageType: 'LIST', category: 'Software Vendor', filePath: 'src/app/(dashboard)/inventory-labels/page.tsx' },
  ];

  // Insert all CRM pages
  for (const page of crmPages) {
    await safeInsertPage({
      routePath: page.routePath,
      routePattern: page.routePath.replace(/:(\w+)/g, '[$1]'),
      portal: 'crm',
      filePath: page.filePath,
      friendlyName: page.friendlyName,
      pageType: page.pageType,
      category: page.category,
      moduleCode: (page as { moduleCode?: string }).moduleCode ?? null,
      hasParams: (page as { hasParams?: boolean }).hasParams ?? false,
      paramNames: (page as { paramNames?: string[] }).paramNames ?? [],
    });
  }

  // Insert all vendor pages
  for (const page of vendorPages) {
    await safeInsertPage({
      routePath: page.routePath,
      routePattern: page.routePath.replace(/:(\w+)/g, '[$1]'),
      portal: 'vendor',
      filePath: page.filePath,
      friendlyName: page.friendlyName,
      pageType: page.pageType,
      category: page.category,
      hasParams: (page as { hasParams?: boolean }).hasParams ?? false,
      paramNames: (page as { paramNames?: string[] }).paramNames ?? [],
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PART 4: ERROR AUTO-REPORT RULES (only if 0 exist)
  // ═══════════════════════════════════════════════════════════
  console.log('🚨 Error auto-report rules...');

  const ruleCount = await prisma.errorAutoReportRule.count();
  if (ruleCount === 0) {
    const rules = [
      { name: 'Critical → Email + Auto-Ticket', severity: 'CRITICAL' as const, channels: ['EMAIL', 'AUTO_TICKET'], throttleMinutes: 5, isActive: true },
      { name: 'Error → Email Alert', severity: 'ERROR' as const, channels: ['EMAIL'], throttleMinutes: 15, isActive: true },
      { name: 'Warning → Daily Digest', severity: 'WARNING' as const, channels: ['EMAIL'], throttleMinutes: 1440, isActive: true },
    ];
    for (const rule of rules) {
      await prisma.errorAutoReportRule.create({ data: rule });
      stats.errorRules.created++;
      console.log(`  ✅ Error rule created: ${rule.name}`);
    }
  } else {
    stats.errorRules.existed = ruleCount;
    console.log(`  ⏭️  ${ruleCount} error auto-report rules already exist`);
  }

  // ═══════════════════════════════════════════════════════════
  // PART 5: SAMPLE ERROR LOGS (only if < 3 exist)
  // ═══════════════════════════════════════════════════════════
  console.log('🐛 Sample error logs...');

  const errorCount = await prisma.errorLog.count();
  if (errorCount < 3) {
    const sampleErrors = [
      {
        requestId: `seed-${Date.now()}-1`,
        errorCode: 'VALIDATION_ERROR',
        message: 'Contact email format invalid: missing @ symbol',
        statusCode: 400,
        severity: 'WARNING' as const,
        path: '/api/v1/contacts',
        method: 'POST',
        status: 'OPEN',
        requestHeaders: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
        responseBody: { error: 'Validation failed', details: ['email must be a valid email'] },
        responseTimeMs: 45,
      },
      {
        requestId: `seed-${Date.now()}-2`,
        errorCode: 'DB_UNIQUE_CONSTRAINT',
        message: 'Unique constraint violation on Contact.email',
        statusCode: 409,
        severity: 'ERROR' as const,
        path: '/api/v1/contacts',
        method: 'POST',
        status: 'OPEN',
        requestHeaders: { 'content-type': 'application/json' },
        responseBody: { error: 'Duplicate entry' },
        responseTimeMs: 120,
        tenantId,
        tenantName: defaultTenant.name,
      },
      {
        requestId: `seed-${Date.now()}-3`,
        errorCode: 'AUTH_JWT_EXPIRED',
        message: 'JWT token expired — user session timed out after 24h',
        statusCode: 401,
        severity: 'INFO' as const,
        path: '/api/v1/leads',
        method: 'GET',
        status: 'OPEN',
        responseTimeMs: 5,
      },
      {
        requestId: `seed-${Date.now()}-4`,
        errorCode: 'INTEGRATION_TIMEOUT',
        message: 'WhatsApp API timeout after 30s — connection refused',
        statusCode: 504,
        severity: 'ERROR' as const,
        path: '/api/v1/whatsapp/send',
        method: 'POST',
        status: 'OPEN',
        requestHeaders: { 'content-type': 'application/json' },
        responseBody: { error: 'Gateway timeout' },
        responseTimeMs: 30125,
        tenantId,
        tenantName: defaultTenant.name,
      },
      {
        requestId: `seed-${Date.now()}-5`,
        errorCode: 'SYSTEM_OOM',
        message: 'Out of memory: heap allocation failed during bulk import of 50,000 contacts',
        statusCode: 500,
        severity: 'CRITICAL' as const,
        path: '/api/v1/import/process',
        method: 'POST',
        status: 'OPEN',
        stack: 'Error: Out of memory\n    at BulkImportService.processChunk\n    at ImportController.process\n    at NestJS pipeline',
        responseTimeMs: 45000,
        tenantId,
        tenantName: defaultTenant.name,
      },
    ];

    for (const err of sampleErrors) {
      await prisma.errorLog.create({ data: err });
      stats.errors.created++;
    }
    console.log(`  ✅ Created ${sampleErrors.length} sample error logs`);
  } else {
    stats.errors.existed = errorCount;
    console.log(`  ⏭️  ${errorCount} error logs already exist`);
  }

  // ═══════════════════════════════════════════════════════════
  // PART 6: SAMPLE SUPPORT TICKETS (only if 0 exist)
  // ═══════════════════════════════════════════════════════════
  console.log('🎫 Sample support tickets...');

  const ticketCount = await prisma.supportTicket.count();
  if (ticketCount === 0) {
    const firstUser = await prisma.user.findFirst({ where: { tenantId } });

    if (firstUser) {
      const tickets = [
        {
          ticketNo: 'TKT-2026-0001',
          subject: 'Invoice PDF not generating — download shows 500 error',
          category: 'BUG' as const,
          priority: 'HIGH' as const,
          status: 'OPEN' as const,
          description: 'When I click "Download PDF" on any invoice, it shows a 500 internal server error. Tried multiple browsers (Chrome, Firefox). Started happening after the last update.',
          tenantId,
          reportedById: firstUser.id,
          reportedByName: `${firstUser.firstName} ${firstUser.lastName}`,
          reportedByEmail: firstUser.email,
          tenantName: defaultTenant.name,
        },
        {
          ticketNo: 'TKT-2026-0002',
          subject: 'Bulk import hangs at validation step for large CSV files',
          category: 'PERFORMANCE' as const,
          priority: 'MEDIUM' as const,
          status: 'IN_PROGRESS' as const,
          description: 'CSV with 5,000+ contacts gets stuck at "Validating..." step. Progress bar reaches 30% and stops. Smaller files (< 500 rows) work fine.',
          tenantId,
          reportedById: firstUser.id,
          reportedByName: `${firstUser.firstName} ${firstUser.lastName}`,
          reportedByEmail: firstUser.email,
          tenantName: defaultTenant.name,
        },
        {
          ticketNo: 'TKT-2026-0003',
          subject: 'WhatsApp integration — all messages failing with connection refused',
          category: 'BUG' as const,
          priority: 'URGENT' as const,
          status: 'OPEN' as const,
          description: 'All WhatsApp messages are failing. Error: "Connection refused". WhatsApp Business API credentials are correct — was working yesterday.',
          tenantId,
          reportedById: firstUser.id,
          reportedByName: `${firstUser.firstName} ${firstUser.lastName}`,
          reportedByEmail: firstUser.email,
          tenantName: defaultTenant.name,
          slaBreached: true,
        },
      ];

      for (const ticket of tickets) {
        const exists = await prisma.supportTicket.findFirst({
          where: { ticketNo: ticket.ticketNo },
        });
        if (!exists) {
          await prisma.supportTicket.create({ data: ticket });
          stats.tickets.created++;
          console.log(`  ✅ Ticket created: ${ticket.ticketNo} → ${ticket.subject.substring(0, 50)}...`);
        } else {
          stats.tickets.existed++;
        }
      }
    } else {
      console.log('  ⚠️  No user found — skipping support tickets');
    }
  } else {
    stats.tickets.existed = ticketCount;
    console.log(`  ⏭️  ${ticketCount} support tickets already exist`);
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  SAFE SEED SUMMARY                                       ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  Menus:          ${String(stats.menus.created).padStart(3)} created, ${String(stats.menus.existed).padStart(3)} already existed  ║`);
  console.log(`║  Pages:          ${String(stats.pages.created).padStart(3)} created, ${String(stats.pages.existed).padStart(3)} already existed  ║`);
  console.log(`║  Error Rules:    ${String(stats.errorRules.created).padStart(3)} created, ${String(stats.errorRules.existed).padStart(3)} already existed  ║`);
  console.log(`║  Sample Errors:  ${String(stats.errors.created).padStart(3)} created, ${String(stats.errors.existed).padStart(3)} already existed  ║`);
  console.log(`║  Sample Tickets: ${String(stats.tickets.created).padStart(3)} created, ${String(stats.tickets.existed).padStart(3)} already existed  ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');
}
