/**
 * TRAVEL Vertical — Travel agencies, tour operators, booking management
 */
import { PlatformConsolePrismaService } from '../../../src/modules/platform-console/prisma/platform-console-prisma.service';

export async function seedTravel(db: PlatformConsolePrismaService) {
  console.log('✈️  Seeding TRAVEL...');

  const vertical = await db.pcVerticalV2.upsert({
    where: { verticalCode: 'TRAVEL' },
    update: {},
    create: {
      verticalCode: 'TRAVEL',
      verticalName: 'Travel Industry',
      displayName: 'Travel',
      description: 'Complete solution for travel agencies, tour operators, and booking management',
      iconName: 'Plane',
      colorTheme: '#0288d1',
      folderPath: 'verticals/travel',
      packageName: '@crmsoft/vertical-travel',
      databaseSchemas: ['working_db', 'identity_db', 'travel_db'],
      apiPrefix: '/api/v1/travel',
      isActive: false,
      isComingSoon: true,
      sortOrder: 2,
      basePrice: 1499,
      perUserPrice: 149,
      defaultSettings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        commission_structure: 'percentage',
        default_markup: 10,
      },
    },
  });

  const moduleDefs = [
    { moduleCode: 'DASHBOARD', moduleName: 'Dashboard', displayName: 'Dashboard', isRequired: true, isDefaultEnabled: true, iconName: 'LayoutDashboard', sortOrder: 0 },
    { moduleCode: 'CRM', moduleName: 'CRM', displayName: 'CRM', isRequired: true, isDefaultEnabled: true, iconName: 'Users', sortOrder: 1 },
    { moduleCode: 'ACCOUNTING', moduleName: 'Accounting', displayName: 'Accounting', isDefaultEnabled: true, iconName: 'Calculator', sortOrder: 2 },
    { moduleCode: 'TOUR_PACKAGES', moduleName: 'Tour Packages', displayName: 'Tours', description: 'Create and manage tour packages', iconName: 'MapPin', colorTheme: '#0288d1', sortOrder: 10 },
    { moduleCode: 'BOOKINGS', moduleName: 'Bookings', displayName: 'Bookings', description: 'Manage customer bookings', iconName: 'BookOpen', colorTheme: '#00796b', sortOrder: 11 },
    { moduleCode: 'ITINERARY', moduleName: 'Itinerary Builder', displayName: 'Itinerary', description: 'Create detailed travel itineraries', iconName: 'Map', colorTheme: '#388e3c', sortOrder: 12 },
    { moduleCode: 'SUPPLIERS', moduleName: 'Suppliers & Vendors', displayName: 'Suppliers', description: 'Hotels, airlines, transport vendors', iconName: 'Truck', colorTheme: '#f57c00', sortOrder: 13 },
    { moduleCode: 'COMMISSION', moduleName: 'Commission Management', displayName: 'Commission', description: 'Track agent commissions', iconName: 'Percent', colorTheme: '#c2185b', sortOrder: 14 },
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
    { menuCode: 'travel_dashboard', menuLabel: 'Dashboard', route: '/dashboard', iconName: 'LayoutDashboard', moduleCode: 'DASHBOARD', sortOrder: 1 },
    { menuCode: 'tour_packages', menuLabel: 'Tour Packages', route: '/tour-packages', iconName: 'MapPin', moduleCode: 'TOUR_PACKAGES', sortOrder: 10 },
    { menuCode: 'tour_categories', menuLabel: 'Categories', route: '/tour-categories', iconName: 'Folder', moduleCode: 'TOUR_PACKAGES', sortOrder: 11 },
    { menuCode: 'destinations', menuLabel: 'Destinations', route: '/destinations', iconName: 'Globe', moduleCode: 'TOUR_PACKAGES', sortOrder: 12 },
    { menuCode: 'bookings', menuLabel: 'All Bookings', route: '/bookings', iconName: 'BookOpen', moduleCode: 'BOOKINGS', sortOrder: 20 },
    { menuCode: 'pending_bookings', menuLabel: 'Pending', route: '/bookings/pending', iconName: 'Clock', moduleCode: 'BOOKINGS', sortOrder: 21 },
    { menuCode: 'confirmed_bookings', menuLabel: 'Confirmed', route: '/bookings/confirmed', iconName: 'CheckCircle', moduleCode: 'BOOKINGS', sortOrder: 22 },
    { menuCode: 'itinerary_builder', menuLabel: 'Itinerary Builder', route: '/itinerary', iconName: 'Map', moduleCode: 'ITINERARY', sortOrder: 30 },
    { menuCode: 'itinerary_templates', menuLabel: 'Templates', route: '/itinerary/templates', iconName: 'FileText', moduleCode: 'ITINERARY', sortOrder: 31 },
    { menuCode: 'hotels', menuLabel: 'Hotels', route: '/suppliers/hotels', iconName: 'Building', moduleCode: 'SUPPLIERS', sortOrder: 40 },
    { menuCode: 'airlines', menuLabel: 'Airlines', route: '/suppliers/airlines', iconName: 'Plane', moduleCode: 'SUPPLIERS', sortOrder: 41 },
    { menuCode: 'transport', menuLabel: 'Transport', route: '/suppliers/transport', iconName: 'Car', moduleCode: 'SUPPLIERS', sortOrder: 42 },
    { menuCode: 'commission_dashboard', menuLabel: 'Commission Dashboard', route: '/commission', iconName: 'Percent', moduleCode: 'COMMISSION', sortOrder: 50 },
    { menuCode: 'agent_payouts', menuLabel: 'Agent Payouts', route: '/commission/payouts', iconName: 'Wallet', moduleCode: 'COMMISSION', sortOrder: 51 },
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
    { featureCode: 'package_builder', featureName: 'Visual Package Builder', category: 'core', isDefaultEnabled: true, moduleCode: 'TOUR_PACKAGES' },
    { featureCode: 'pdf_itinerary', featureName: 'PDF Itinerary Generator', category: 'core', isDefaultEnabled: true, moduleCode: 'ITINERARY' },
    { featureCode: 'booking_confirmation_email', featureName: 'Auto Booking Confirmation', category: 'core', isDefaultEnabled: true, moduleCode: 'BOOKINGS' },
    { featureCode: 'gds_integration', featureName: 'GDS Integration (Amadeus/Sabre)', category: 'premium', isDefaultEnabled: false, moduleCode: 'SUPPLIERS' },
    { featureCode: 'b2b_portal', featureName: 'B2B Agent Portal', category: 'premium', isDefaultEnabled: false },
    { featureCode: 'commission_automation', featureName: 'Auto Commission Calculation', category: 'core', isDefaultEnabled: true, moduleCode: 'COMMISSION' },
    { featureCode: 'multi_currency_travel', featureName: 'Multi-Currency Pricing', category: 'premium', isDefaultEnabled: false },
    { featureCode: 'visa_management', featureName: 'Visa Management', category: 'premium', isDefaultEnabled: false, isBeta: true },
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

  console.log('  ✅ TRAVEL: 8 modules, 14 menus, 8 features');
  return vertical;
}
