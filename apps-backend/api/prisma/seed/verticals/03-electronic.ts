/**
 * ELECTRONIC Vertical — Electronics retail, distribution, and service centers
 */
import { PlatformConsolePrismaService } from '../../../src/modules/platform-console/prisma/platform-console-prisma.service';

export async function seedElectronic(db: PlatformConsolePrismaService) {
  console.log('📱 Seeding ELECTRONIC...');

  const vertical = await db.pcVerticalV2.upsert({
    where: { verticalCode: 'ELECTRONIC' },
    update: {},
    create: {
      verticalCode: 'ELECTRONIC',
      verticalName: 'Electronic Retail & Service',
      displayName: 'Electronic',
      description: 'Complete platform for electronic retail, distribution, and service centers',
      iconName: 'Smartphone',
      colorTheme: '#388e3c',
      folderPath: 'verticals/electronic',
      packageName: '@crmsoft/vertical-electronic',
      databaseSchemas: ['working_db', 'identity_db', 'electronic_db'],
      apiPrefix: '/api/v1/electronic',
      isActive: false,
      isComingSoon: true,
      sortOrder: 3,
      basePrice: 1299,
      perUserPrice: 129,
    },
  });

  const moduleDefs = [
    { moduleCode: 'DASHBOARD', moduleName: 'Dashboard', displayName: 'Dashboard', isRequired: true, isDefaultEnabled: true, iconName: 'LayoutDashboard', sortOrder: 0 },
    { moduleCode: 'CRM', moduleName: 'CRM', displayName: 'CRM', isRequired: true, isDefaultEnabled: true, iconName: 'Users', sortOrder: 1 },
    { moduleCode: 'ACCOUNTING', moduleName: 'Accounting', displayName: 'Accounting', isDefaultEnabled: true, iconName: 'Calculator', sortOrder: 2 },
    { moduleCode: 'INVENTORY', moduleName: 'Inventory', displayName: 'Inventory', isRequired: true, isDefaultEnabled: true, iconName: 'Package', sortOrder: 3 },
    { moduleCode: 'PRODUCT_CATALOG', moduleName: 'Product Catalog', displayName: 'Catalog', description: 'Electronic products with specs', iconName: 'Layers', colorTheme: '#388e3c', sortOrder: 10 },
    { moduleCode: 'SERVICE_CENTER', moduleName: 'Service Center', displayName: 'Service', description: 'Repairs, warranty, service tickets', iconName: 'Wrench', colorTheme: '#d32f2f', sortOrder: 11 },
    { moduleCode: 'DISTRIBUTION', moduleName: 'Distribution Network', displayName: 'Distribution', description: 'Dealers, distributors, franchise', iconName: 'Network', colorTheme: '#7b1fa2', sortOrder: 12 },
    { moduleCode: 'WARRANTY', moduleName: 'Warranty Management', displayName: 'Warranty', description: 'Track warranty claims', iconName: 'ShieldCheck', colorTheme: '#0288d1', sortOrder: 13 },
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
    { menuCode: 'electronic_dashboard', menuLabel: 'Dashboard', route: '/dashboard', iconName: 'LayoutDashboard', moduleCode: 'DASHBOARD', sortOrder: 1 },
    { menuCode: 'product_catalog', menuLabel: 'Products', route: '/products', iconName: 'Layers', moduleCode: 'PRODUCT_CATALOG', sortOrder: 10 },
    { menuCode: 'product_categories', menuLabel: 'Categories', route: '/categories', iconName: 'FolderTree', moduleCode: 'PRODUCT_CATALOG', sortOrder: 11 },
    { menuCode: 'brands_mgmt', menuLabel: 'Brands', route: '/brands', iconName: 'Tag', moduleCode: 'PRODUCT_CATALOG', sortOrder: 12 },
    { menuCode: 'specifications', menuLabel: 'Specifications', route: '/specifications', iconName: 'FileText', moduleCode: 'PRODUCT_CATALOG', sortOrder: 13 },
    { menuCode: 'service_tickets', menuLabel: 'Service Tickets', route: '/service', iconName: 'Wrench', moduleCode: 'SERVICE_CENTER', sortOrder: 20 },
    { menuCode: 'repair_jobs', menuLabel: 'Repair Jobs', route: '/repairs', iconName: 'Settings', moduleCode: 'SERVICE_CENTER', sortOrder: 21 },
    { menuCode: 'technicians', menuLabel: 'Technicians', route: '/technicians', iconName: 'Users', moduleCode: 'SERVICE_CENTER', sortOrder: 22 },
    { menuCode: 'dealers', menuLabel: 'Dealers', route: '/dealers', iconName: 'Store', moduleCode: 'DISTRIBUTION', sortOrder: 30 },
    { menuCode: 'distributors', menuLabel: 'Distributors', route: '/distributors', iconName: 'Truck', moduleCode: 'DISTRIBUTION', sortOrder: 31 },
    { menuCode: 'franchise', menuLabel: 'Franchise', route: '/franchise', iconName: 'Building2', moduleCode: 'DISTRIBUTION', sortOrder: 32 },
    { menuCode: 'warranty_claims', menuLabel: 'Claims', route: '/warranty', iconName: 'ShieldCheck', moduleCode: 'WARRANTY', sortOrder: 40 },
    { menuCode: 'warranty_terms', menuLabel: 'Terms & Policies', route: '/warranty/terms', iconName: 'FileText', moduleCode: 'WARRANTY', sortOrder: 41 },
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
    { featureCode: 'serial_tracking', featureName: 'Serial Number Tracking', category: 'core', isDefaultEnabled: true, moduleCode: 'PRODUCT_CATALOG' },
    { featureCode: 'imei_tracking', featureName: 'IMEI Tracking', category: 'core', isDefaultEnabled: true, moduleCode: 'PRODUCT_CATALOG' },
    { featureCode: 'service_history', featureName: 'Service History Tracking', category: 'core', isDefaultEnabled: true, moduleCode: 'SERVICE_CENTER' },
    { featureCode: 'warranty_calculator', featureName: 'Warranty Period Calculator', category: 'core', isDefaultEnabled: true, moduleCode: 'WARRANTY' },
    { featureCode: 'dealer_portal', featureName: 'Dealer B2B Portal', category: 'premium', isDefaultEnabled: false, moduleCode: 'DISTRIBUTION' },
    { featureCode: 'spare_parts', featureName: 'Spare Parts Management', category: 'premium', isDefaultEnabled: false, moduleCode: 'SERVICE_CENTER' },
    { featureCode: 'ecommerce_sync', featureName: 'Amazon/Flipkart Sync', category: 'premium', isDefaultEnabled: false, isBeta: true },
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
      } as any,
    });
  }

  console.log('  ✅ ELECTRONIC: 8 modules, 13 menus, 7 features');
  return vertical;
}
