/**
 * CRM_GENERAL Vertical — Complete Seed
 * Base vertical for all businesses: CRM + Accounting + Inventory + Communication
 */
import { PlatformConsolePrismaService } from '../../../src/modules/platform-console/prisma/platform-console-prisma.service';

export async function seedCRMGeneral(db: PlatformConsolePrismaService) {
  console.log('🏢 Seeding CRM_GENERAL...');

  const vertical = await db.pcVerticalV2.upsert({
    where: { verticalCode: 'CRM_GENERAL' },
    update: {},
    create: {
      verticalCode: 'CRM_GENERAL',
      verticalName: 'General Business CRM',
      displayName: 'CRM General',
      description: 'Complete CRM solution for any business — leads, customers, sales, accounting, inventory, and communications',
      iconName: 'Building2',
      colorTheme: '#1976d2',
      folderPath: 'verticals/general',
      packageName: '@crmsoft/vertical-general',
      databaseSchemas: ['working_db', 'identity_db'],
      apiPrefix: '/api/v1/general',
      isActive: true,
      sortOrder: 1,
      basePrice: 999,
      perUserPrice: 99,
      defaultSettings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        date_format: 'DD/MM/YYYY',
        fiscal_year_start: 'April',
      },
    },
  });

  // ── Modules ──────────────────────────────────────────────────────
  const moduleDefs = [
    {
      moduleCode: 'DASHBOARD', moduleName: 'Dashboard & Reports', displayName: 'Dashboard',
      description: 'KPI dashboards, MIS reports, analytics',
      isRequired: true, isDefaultEnabled: true, iconName: 'LayoutDashboard', colorTheme: '#c2185b', sortOrder: 0,
      packagePath: 'modules/dashboard', apiNamespace: 'dashboard',
    },
    {
      moduleCode: 'CRM', moduleName: 'Customer Relationship Management', displayName: 'CRM',
      description: 'Manage leads, contacts, organizations, activities, tasks',
      isRequired: true, isDefaultEnabled: true, iconName: 'Users', colorTheme: '#1976d2', sortOrder: 1,
      packagePath: 'modules/crm', apiNamespace: 'crm',
      dbTables: ['leads', 'contacts', 'organizations', 'activities', 'tasks'],
    },
    {
      moduleCode: 'ACCOUNTING', moduleName: 'Accounting & Finance', displayName: 'Accounting',
      description: 'Invoicing, payments, quotations, sales, accounts',
      isDefaultEnabled: true, iconName: 'Calculator', colorTheme: '#388e3c', sortOrder: 2,
      packagePath: 'modules/accounting', apiNamespace: 'accounting',
      dbTables: ['invoices', 'payments', 'quotations', 'sales_orders', 'chart_of_accounts'],
      dependsOn: ['CRM'],
    },
    {
      moduleCode: 'INVENTORY', moduleName: 'Inventory Management', displayName: 'Inventory',
      description: 'Products, pricing, stock, units, tax configuration',
      isDefaultEnabled: true, iconName: 'Package', colorTheme: '#f57c00', sortOrder: 3,
      packagePath: 'modules/inventory', apiNamespace: 'inventory',
      dbTables: ['products', 'pricing', 'stock', 'units', 'taxes'],
    },
    {
      moduleCode: 'COMMUNICATION', moduleName: 'Communication Hub', displayName: 'Communication',
      description: 'Email, WhatsApp, support tickets',
      isDefaultEnabled: true, iconName: 'MessageSquare', colorTheme: '#7b1fa2', sortOrder: 4,
      packagePath: 'modules/communication', apiNamespace: 'communication',
    },
  ];

  const mods: Record<string, any> = {};
  for (const m of moduleDefs) {
    const rec = await db.pcVerticalModule.upsert({
      where: { verticalId_moduleCode: { verticalId: vertical.id, moduleCode: m.moduleCode } },
      update: {},
      create: { verticalId: vertical.id, ...m } as any,
    });
    mods[m.moduleCode] = rec;
  }

  // ── Menus ─────────────────────────────────────────────────────────
  const menuDefs = [
    // Dashboard
    { menuCode: 'dashboard', menuLabel: 'Dashboard', route: '/dashboard', iconName: 'LayoutDashboard', moduleCode: 'DASHBOARD', sortOrder: 1 },
    { menuCode: 'analytics', menuLabel: 'Analytics', route: '/analytics', iconName: 'TrendingUp', moduleCode: 'DASHBOARD', sortOrder: 2 },
    // CRM
    { menuCode: 'leads', menuLabel: 'Leads', route: '/leads', iconName: 'Target', moduleCode: 'CRM', sortOrder: 10 },
    { menuCode: 'contacts', menuLabel: 'Contacts', route: '/contacts', iconName: 'UserCircle', moduleCode: 'CRM', sortOrder: 11 },
    { menuCode: 'organizations', menuLabel: 'Organizations', route: '/organizations', iconName: 'Building', moduleCode: 'CRM', sortOrder: 12 },
    { menuCode: 'activities', menuLabel: 'Activities', route: '/activities', iconName: 'Calendar', moduleCode: 'CRM', sortOrder: 13 },
    { menuCode: 'tasks', menuLabel: 'Tasks', route: '/tasks', iconName: 'CheckSquare', moduleCode: 'CRM', sortOrder: 14 },
    // Accounting
    { menuCode: 'quotations', menuLabel: 'Quotations', route: '/quotations', iconName: 'FileText', moduleCode: 'ACCOUNTING', sortOrder: 20 },
    { menuCode: 'sales_orders', menuLabel: 'Sales Orders', route: '/sales-orders', iconName: 'ShoppingBag', moduleCode: 'ACCOUNTING', sortOrder: 21 },
    { menuCode: 'invoices', menuLabel: 'Invoices', route: '/invoices', iconName: 'Receipt', moduleCode: 'ACCOUNTING', sortOrder: 22 },
    { menuCode: 'payments', menuLabel: 'Payments', route: '/payments', iconName: 'CreditCard', moduleCode: 'ACCOUNTING', sortOrder: 23 },
    { menuCode: 'accounts', menuLabel: 'Chart of Accounts', route: '/accounts', iconName: 'BookOpen', moduleCode: 'ACCOUNTING', sortOrder: 24 },
    // Inventory
    { menuCode: 'products', menuLabel: 'Products', route: '/products', iconName: 'Package2', moduleCode: 'INVENTORY', sortOrder: 30 },
    { menuCode: 'pricing', menuLabel: 'Pricing', route: '/pricing', iconName: 'Tag', moduleCode: 'INVENTORY', sortOrder: 31 },
    { menuCode: 'stock', menuLabel: 'Stock', route: '/stock', iconName: 'Warehouse', moduleCode: 'INVENTORY', sortOrder: 32 },
    // Communication
    { menuCode: 'email', menuLabel: 'Email', route: '/email', iconName: 'Mail', moduleCode: 'COMMUNICATION', sortOrder: 40 },
    { menuCode: 'whatsapp', menuLabel: 'WhatsApp', route: '/whatsapp', iconName: 'MessageCircle', moduleCode: 'COMMUNICATION', sortOrder: 41 },
    { menuCode: 'support', menuLabel: 'Support Tickets', route: '/support', iconName: 'LifeBuoy', moduleCode: 'COMMUNICATION', sortOrder: 42 },
  ];

  for (const menu of menuDefs) {
    await db.pcVerticalMenu.upsert({
      where: { verticalId_menuCode: { verticalId: vertical.id, menuCode: menu.menuCode } },
      update: {},
      create: {
        verticalId: vertical.id,
        moduleId: mods[menu.moduleCode]?.id,
        menuCode: menu.menuCode,
        menuLabel: menu.menuLabel,
        route: menu.route,
        iconName: menu.iconName,
        sortOrder: menu.sortOrder,
      },
    });
  }

  // ── Features ──────────────────────────────────────────────────────
  const featureDefs = [
    // CRM
    { featureCode: 'lead_scoring', featureName: 'AI Lead Scoring', category: 'premium', isDefaultEnabled: true, moduleCode: 'CRM', iconName: 'Sparkles' },
    { featureCode: 'lead_routing', featureName: 'Auto Lead Routing', category: 'core', isDefaultEnabled: true, moduleCode: 'CRM' },
    { featureCode: 'bulk_import', featureName: 'Bulk Import', category: 'core', isDefaultEnabled: true, moduleCode: 'CRM' },
    { featureCode: 'custom_fields', featureName: 'Custom Fields', category: 'core', isDefaultEnabled: true, moduleCode: 'CRM' },
    // Accounting
    { featureCode: 'gst_compliance', featureName: 'GST Compliance (India)', category: 'core', isDefaultEnabled: true, moduleCode: 'ACCOUNTING' },
    { featureCode: 'multi_currency', featureName: 'Multi-Currency', category: 'premium', isDefaultEnabled: false, moduleCode: 'ACCOUNTING' },
    { featureCode: 'auto_invoice', featureName: 'Auto Invoice Generation', category: 'premium', isDefaultEnabled: false, moduleCode: 'ACCOUNTING' },
    { featureCode: 'payment_reminders', featureName: 'Payment Reminders', category: 'core', isDefaultEnabled: true, moduleCode: 'ACCOUNTING' },
    // Inventory
    { featureCode: 'barcode_scanning', featureName: 'Barcode Scanning', category: 'core', isDefaultEnabled: true, moduleCode: 'INVENTORY' },
    { featureCode: 'stock_alerts', featureName: 'Low Stock Alerts', category: 'core', isDefaultEnabled: true, moduleCode: 'INVENTORY' },
    { featureCode: 'multi_warehouse', featureName: 'Multi-Warehouse', category: 'premium', isDefaultEnabled: false, moduleCode: 'INVENTORY' },
    // Communication
    { featureCode: 'whatsapp_integration', featureName: 'WhatsApp Business API', category: 'premium', isDefaultEnabled: false, moduleCode: 'COMMUNICATION' },
    { featureCode: 'email_templates', featureName: 'Email Templates', category: 'core', isDefaultEnabled: true, moduleCode: 'COMMUNICATION' },
    { featureCode: 'bulk_messaging', featureName: 'Bulk Messaging', category: 'premium', isDefaultEnabled: false, moduleCode: 'COMMUNICATION' },
    // Dashboard
    { featureCode: 'custom_reports', featureName: 'Custom Report Builder', category: 'premium', isDefaultEnabled: false, moduleCode: 'DASHBOARD' },
    { featureCode: 'export_excel', featureName: 'Export to Excel', category: 'core', isDefaultEnabled: true, moduleCode: 'DASHBOARD' },
    { featureCode: 'scheduled_reports', featureName: 'Scheduled Reports', category: 'premium', isDefaultEnabled: false, moduleCode: 'DASHBOARD' },
    // Cross-cutting AI
    { featureCode: 'ai_insights', featureName: 'AI Business Insights', category: 'premium', isDefaultEnabled: false, isBeta: true, iconName: 'Brain' },
    { featureCode: 'ai_chatbot', featureName: 'AI Chatbot', category: 'premium', isDefaultEnabled: false, isBeta: true },
  ];

  for (const f of featureDefs) {
    await db.pcVerticalFeature.upsert({
      where: { verticalId_featureCode: { verticalId: vertical.id, featureCode: f.featureCode } },
      update: {},
      create: {
        verticalId: vertical.id,
        moduleId: (f as any).moduleCode ? mods[(f as any).moduleCode]?.id : null,
        featureCode: f.featureCode,
        featureName: f.featureName,
        category: f.category,
        isDefaultEnabled: f.isDefaultEnabled,
        isBeta: (f as any).isBeta ?? false,
        iconName: (f as any).iconName ?? null,
      } as any,
    });
  }

  console.log('  ✅ CRM_GENERAL: 5 modules, 18 menus, 19 features');
  return vertical;
}
