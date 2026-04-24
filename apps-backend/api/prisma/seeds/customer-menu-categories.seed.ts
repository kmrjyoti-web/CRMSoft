import { PrismaClient as IdentityClient } from '@prisma/identity-client';

const prisma = new IdentityClient();

const DEFAULT_CATEGORIES = [
  {
    name: 'Basic Customer',
    nameHi: 'बेसिक ग्राहक',
    description: 'Dashboard, profile, invoices, payments, support — essential self-service',
    icon: 'user',
    color: 'blue',
    isDefault: true,
    sortOrder: 0,
    enabledRoutes: [
      '/dashboard', '/profile', '/invoices', '/payments',
      '/support', '/support/new', '/notifications', '/settings',
    ],
  },
  {
    name: 'Premium Customer',
    nameHi: 'प्रीमियम ग्राहक',
    description: 'Full self-service — all pages including products, orders, documents, employees',
    icon: 'crown',
    color: 'purple',
    isDefault: false,
    sortOrder: 1,
    enabledRoutes: [
      '/dashboard', '/profile', '/products', '/invoices', '/payments', '/ledger',
      '/quotations', '/orders', '/support', '/support/new', '/documents',
      '/employees', '/notifications', '/settings', '/amc-warranty',
    ],
  },
  {
    name: 'Vendor View',
    nameHi: 'विक्रेता दृश्य',
    description: 'For suppliers — purchase orders, payments, documents',
    icon: 'truck',
    color: 'orange',
    isDefault: false,
    sortOrder: 2,
    enabledRoutes: [
      '/dashboard', '/profile', '/orders', '/invoices', '/payments',
      '/ledger', '/documents', '/notifications', '/settings',
    ],
  },
  {
    name: 'Ledger Only',
    nameHi: 'केवल खाता',
    description: 'Finance contacts — invoices, payments, ledger statement only',
    icon: 'calculator',
    color: 'green',
    isDefault: false,
    sortOrder: 3,
    enabledRoutes: [
      '/dashboard', '/profile', '/invoices', '/payments',
      '/ledger', '/notifications', '/settings',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Customer Menu Categories...');

  // Use a platform-level tenantId (empty string = global/system level)
  const systemTenantId = '';
  const systemAdminId = 'system';

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.customerMenuCategory.findFirst({
      where: { tenantId: systemTenantId, name: cat.name },
    });

    if (existing) {
      console.log(`  ↩  Skipping "${cat.name}" (already exists)`);
      continue;
    }

    await prisma.customerMenuCategory.create({
      data: {
        tenantId: systemTenantId,
        createdById: systemAdminId,
        ...cat,
      },
    });
    console.log(`  ✅  Created "${cat.name}"`);
  }

  console.log('✅ Customer Menu Categories seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
