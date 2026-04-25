/**
 * seed-multi-brand.ts — Seeds brands, verticals, and updates kmrjyoti's mapping.
 *
 * Safe to re-run (upsert-based).
 *
 * Usage:
 *   npx ts-node --transpile-only prisma/seeds/identity/seed-multi-brand.ts
 */

import { PrismaClient } from '@prisma/identity-client';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function main() {
  console.log('🌱 Seeding multi-brand config...\n');

  // ─── BRANDS ───
  const brands = [
    {
      code: 'default',
      name: 'CRMSoft',
      description: 'Default CRMSoft brand',
      domain: null,
      subdomain: 'app',
      theme: { primaryColor: '#3b82f6', secondaryColor: '#8b5cf6' },
      layoutCode: 'default',
      loginVariant: 'standard',
      defaultRedirectByRole: { ADMIN: '/dashboard', MANAGER: '/dashboard', CUSTOMER: '/dashboard' },
    },
    {
      code: 'travvellis',
      name: 'Travvellis',
      description: 'Travel vertical brand',
      domain: 'travvellis.com',
      subdomain: 'travvellis',
      theme: { primaryColor: '#f59e0b', secondaryColor: '#0ea5e9' },
      layoutCode: 'travel',
      loginVariant: 'branded',
      defaultRedirectByRole: { ADMIN: '/dashboard', MANAGER: '/dashboard', CUSTOMER: '/dashboard' },
    },
  ];

  for (const brand of brands) {
    await (identity as any).gvCfgBrand.upsert({
      where: { code: brand.code },
      update: { name: brand.name, theme: brand.theme, defaultRedirectByRole: brand.defaultRedirectByRole },
      create: brand,
    });
    console.log(`✅ Brand: ${brand.code}`);
  }

  // ─── VERTICALS ───
  const verticals = [
    {
      code: 'SOFTWARE',
      name: 'Software / SaaS',
      description: 'Software and technology companies',
      defaultModules: ['contacts', 'leads', 'deals', 'activities'],
      defaultMenu: [],
      terminology: { lead: 'Lead', contact: 'Contact', deal: 'Deal' },
      defaultDashboard: [],
    },
    {
      code: 'TRAVEL',
      name: 'Travel & Tourism',
      description: 'Travel agencies, DMCs, tour operators',
      defaultModules: ['contacts', 'leads', 'quotations', 'tour-plans', 'activities'],
      defaultMenu: [],
      terminology: { lead: 'Enquiry', contact: 'Traveler', deal: 'Booking' },
      defaultDashboard: [],
    },
    {
      code: 'RETAIL',
      name: 'Retail & E-Commerce',
      description: 'Retail and e-commerce businesses',
      defaultModules: ['contacts', 'leads', 'products', 'invoices', 'activities'],
      defaultMenu: [],
      terminology: { lead: 'Prospect', contact: 'Customer', deal: 'Order' },
      defaultDashboard: [],
    },
  ];

  for (const vertical of verticals) {
    await (identity as any).gvCfgVertical.upsert({
      where: { code: vertical.code },
      update: { name: vertical.name, terminology: vertical.terminology },
      create: vertical,
    });
    console.log(`✅ Vertical: ${vertical.code}`);
  }

  // ─── UPDATE KMRJYOTI'S MAPPING ───
  const kmrjyoti = await identity.user.findFirst({
    where: { email: 'kmrjyoti@gmail.com' },
    include: { companyMappings: { include: { company: true } } },
  });

  if (kmrjyoti) {
    for (const mapping of kmrjyoti.companyMappings) {
      const company = mapping.company;
      const brandCode = (company as any).brandCode ?? 'default';
      const verticalCode = (company as any).verticalCode ?? 'SOFTWARE';

      await (identity as any).userCompanyMapping.update({
        where: { id: mapping.id },
        data: { brandCode, verticalCode },
      });
      console.log(`✅ Updated mapping for company: ${company.name} → brand=${brandCode}, vertical=${verticalCode}`);
    }
  } else {
    console.log('⚠️  kmrjyoti@gmail.com not found — skipping mapping update');
  }

  console.log('\n✅ Multi-brand seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => identity.$disconnect());
