/**
 * seed-kmrjyoti-travvellis-mapping.ts
 *
 * Creates Travvellis company + maps kmrjyoti@gmail.com to it.
 * Safe to re-run (upsert-based).
 *
 * Usage:
 *   npx ts-node --transpile-only prisma/seeds/identity/seed-kmrjyoti-travvellis-mapping.ts
 */

import { PrismaClient } from '@prisma/identity-client';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function main() {
  // 1. Find kmrjyoti user
  const user = await identity.user.findFirst({ where: { email: 'kmrjyoti@gmail.com' } });
  if (!user) { console.error('❌ kmrjyoti@gmail.com not found'); process.exit(1); }
  console.log('✅ User:', user.email, '| id:', user.id);

  // 2. Upsert Travvellis company
  const company = await (identity as any).company.upsert({
    where: { talentId: 'C0000001' },
    update: { name: 'Travvellis', brandCode: 'travvellis', verticalCode: 'TRAVEL' },
    create: {
      talentId: 'C0000001',
      name: 'Travvellis',
      displayName: 'Travvellis Travel',
      brandCode: 'travvellis',
      verticalCode: 'TRAVEL',
      categoryCode: 'COMPANY_B2B',
      status: 'ACTIVE',
      ownerId: user.id,
    },
  });
  console.log('✅ Company:', company.name, '| id:', company.id, '| brand:', company.brandCode);

  // 3. Upsert mapping (userId + companyId must be unique)
  const mapping = await (identity as any).userCompanyMapping.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: {
      role: 'OWNER',
      status: 'ACTIVE',
      isDefault: true,
      brandCode: 'travvellis',
      verticalCode: 'TRAVEL',
    },
    create: {
      userId: user.id,
      companyId: company.id,
      role: 'OWNER',
      joinMode: 'INVITED',
      status: 'ACTIVE',
      isDefault: true,
      brandCode: 'travvellis',
      verticalCode: 'TRAVEL',
    },
  });
  console.log('✅ Mapping created | role:', mapping.role, '| isDefault:', mapping.isDefault, '| brand:', mapping.brandCode);

  console.log('\n🎯 Done. Test login:');
  console.log('   curl -X POST http://localhost:3001/api/v1/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"kmrjyoti@gmail.com","password":"Travvellis@2026"}\'');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => identity.$disconnect());
