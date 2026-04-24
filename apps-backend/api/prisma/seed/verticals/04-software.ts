/**
 * SOFTWARE Vertical — Software vendors, SaaS companies, digital product resellers
 */
import { PlatformConsolePrismaService } from '../../../src/modules/platform-console/prisma/platform-console-prisma.service';

export async function seedSoftware(db: PlatformConsolePrismaService) {
  console.log('💻 Seeding SOFTWARE...');

  const vertical = await db.pcVerticalV2.upsert({
    where: { verticalCode: 'SOFTWARE' },
    update: {},
    create: {
      verticalCode: 'SOFTWARE',
      verticalName: 'Software Vendor / SaaS',
      displayName: 'Software',
      description: 'Platform for software vendors, SaaS resellers, and digital product companies',
      iconName: 'Code',
      colorTheme: '#7c3aed',
      folderPath: 'verticals/software',
      packageName: '@crmsoft/vertical-software',
      databaseSchemas: ['working_db', 'identity_db', 'software_db'],
      apiPrefix: '/api/v1/software',
      isActive: false,
      isComingSoon: true,
      sortOrder: 4,
      basePrice: 1999,
      perUserPrice: 199,
    },
  });

  const moduleDefs = [
    { moduleCode: 'DASHBOARD', moduleName: 'Dashboard', displayName: 'Dashboard', isRequired: true, isDefaultEnabled: true, iconName: 'LayoutDashboard', sortOrder: 0 },
    { moduleCode: 'CRM', moduleName: 'CRM', displayName: 'CRM', isRequired: true, isDefaultEnabled: true, iconName: 'Users', sortOrder: 1 },
    { moduleCode: 'ACCOUNTING', moduleName: 'Accounting', displayName: 'Accounting', isDefaultEnabled: true, iconName: 'Calculator', sortOrder: 2 },
    { moduleCode: 'LICENSING', moduleName: 'License Management', displayName: 'Licenses', description: 'License keys, activation, expiry', iconName: 'Key', colorTheme: '#7c3aed', sortOrder: 10 },
    { moduleCode: 'SUBSCRIPTIONS', moduleName: 'Subscriptions', displayName: 'Subscriptions', description: 'Recurring billing, renewals', iconName: 'RefreshCcw', colorTheme: '#0288d1', sortOrder: 11 },
    { moduleCode: 'SUPPORT_DESK', moduleName: 'Support Desk', displayName: 'Support', description: 'Tickets, knowledge base', iconName: 'LifeBuoy', colorTheme: '#f57c00', sortOrder: 12 },
    { moduleCode: 'RELEASES', moduleName: 'Release Management', displayName: 'Releases', description: 'Version tracking, changelogs', iconName: 'GitBranch', colorTheme: '#388e3c', sortOrder: 13 },
    { moduleCode: 'PARTNER_PROGRAM', moduleName: 'Partner Program', displayName: 'Partners', description: 'Resellers, affiliates, commissions', iconName: 'Handshake', colorTheme: '#c2185b', sortOrder: 14 },
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

  const menuDefs = [
    { menuCode: 'software_dashboard', menuLabel: 'Dashboard', route: '/dashboard', iconName: 'LayoutDashboard', moduleCode: 'DASHBOARD', sortOrder: 1 },
    { menuCode: 'licenses', menuLabel: 'Licenses', route: '/licenses', iconName: 'Key', moduleCode: 'LICENSING', sortOrder: 10 },
    { menuCode: 'license_keys', menuLabel: 'License Keys', route: '/licenses/keys', iconName: 'Fingerprint', moduleCode: 'LICENSING', sortOrder: 11 },
    { menuCode: 'activations', menuLabel: 'Activations', route: '/licenses/activations', iconName: 'CheckCircle', moduleCode: 'LICENSING', sortOrder: 12 },
    { menuCode: 'subscriptions', menuLabel: 'Subscriptions', route: '/subscriptions', iconName: 'RefreshCcw', moduleCode: 'SUBSCRIPTIONS', sortOrder: 20 },
    { menuCode: 'renewals', menuLabel: 'Renewals', route: '/renewals', iconName: 'Clock', moduleCode: 'SUBSCRIPTIONS', sortOrder: 21 },
    { menuCode: 'billing_plans', menuLabel: 'Billing Plans', route: '/billing/plans', iconName: 'DollarSign', moduleCode: 'SUBSCRIPTIONS', sortOrder: 22 },
    { menuCode: 'support_tickets_sw', menuLabel: 'Tickets', route: '/support', iconName: 'LifeBuoy', moduleCode: 'SUPPORT_DESK', sortOrder: 30 },
    { menuCode: 'knowledge_base', menuLabel: 'Knowledge Base', route: '/kb', iconName: 'BookOpen', moduleCode: 'SUPPORT_DESK', sortOrder: 31 },
    { menuCode: 'versions', menuLabel: 'Versions', route: '/versions', iconName: 'GitBranch', moduleCode: 'RELEASES', sortOrder: 40 },
    { menuCode: 'changelogs', menuLabel: 'Changelogs', route: '/changelogs', iconName: 'FileText', moduleCode: 'RELEASES', sortOrder: 41 },
    { menuCode: 'resellers', menuLabel: 'Resellers', route: '/partners/resellers', iconName: 'Handshake', moduleCode: 'PARTNER_PROGRAM', sortOrder: 50 },
    { menuCode: 'affiliates', menuLabel: 'Affiliates', route: '/partners/affiliates', iconName: 'Link2', moduleCode: 'PARTNER_PROGRAM', sortOrder: 51 },
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

  const featureDefs = [
    { featureCode: 'license_key_generator', featureName: 'License Key Generator', category: 'core', isDefaultEnabled: true, moduleCode: 'LICENSING' },
    { featureCode: 'online_activation', featureName: 'Online Activation API', category: 'core', isDefaultEnabled: true, moduleCode: 'LICENSING' },
    { featureCode: 'recurring_billing', featureName: 'Recurring Billing', category: 'core', isDefaultEnabled: true, moduleCode: 'SUBSCRIPTIONS' },
    { featureCode: 'trial_management', featureName: 'Trial Management', category: 'core', isDefaultEnabled: true, moduleCode: 'SUBSCRIPTIONS' },
    { featureCode: 'customer_portal', featureName: 'Customer Self-Service Portal', category: 'premium', isDefaultEnabled: false },
    { featureCode: 'api_access_control', featureName: 'API Access Control', category: 'premium', isDefaultEnabled: false, moduleCode: 'LICENSING' },
    { featureCode: 'usage_tracking', featureName: 'Usage Tracking & Metering', category: 'premium', isDefaultEnabled: false, moduleCode: 'SUBSCRIPTIONS' },
    { featureCode: 'stripe_integration', featureName: 'Stripe Payment', category: 'core', isDefaultEnabled: true, moduleCode: 'SUBSCRIPTIONS' },
    { featureCode: 'razorpay_integration', featureName: 'Razorpay Payment', category: 'core', isDefaultEnabled: true, moduleCode: 'SUBSCRIPTIONS' },
    { featureCode: 'affiliate_tracking', featureName: 'Affiliate Link Tracking', category: 'premium', isDefaultEnabled: false, moduleCode: 'PARTNER_PROGRAM' },
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
      } as any,
    });
  }

  console.log('  ✅ SOFTWARE: 8 modules, 13 menus, 10 features');
  return vertical;
}
