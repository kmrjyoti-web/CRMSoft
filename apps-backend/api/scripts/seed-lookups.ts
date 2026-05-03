/**
 * Seed all system lookups into PlatformDB.
 * Run: npx tsx scripts/seed-lookups.ts
 */
import { PrismaClient } from '@prisma/platform-client';
import { LOOKUP_SEED_DATA } from '../src/modules/core/platform/lookups/data/lookup-seed-data';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.PLATFORM_DATABASE_URL } },
});

const TENANT_ID = '';

async function main() {
  console.log('Seeding lookup categories...\n');
  let total = 0;

  for (const lk of LOOKUP_SEED_DATA) {
    const lookup = await prisma.masterLookup.upsert({
      where: { tenantId_category: { tenantId: TENANT_ID, category: lk.category } },
      create: { tenantId: TENANT_ID, category: lk.category, displayName: lk.displayName, isSystem: lk.isSystem, isActive: true },
      update: { displayName: lk.displayName, isActive: true },
    });

    for (let i = 0; i < lk.values.length; i++) {
      const v = lk.values[i];
      await prisma.lookupValue.upsert({
        where: { tenantId_lookupId_value: { tenantId: TENANT_ID, lookupId: lookup.id, value: v.value } },
        create: { tenantId: TENANT_ID, lookupId: lookup.id, value: v.value, label: v.label, icon: v.icon ?? null, color: v.color ?? null, rowIndex: i, isActive: true },
        update: { label: v.label, icon: v.icon ?? null, color: v.color ?? null, rowIndex: i, isActive: true },
      });
    }

    console.log(`  ✅ ${lk.category} (${lk.values.length} values)`);
    total++;
  }

  console.log(`\nDone — seeded ${total} categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
