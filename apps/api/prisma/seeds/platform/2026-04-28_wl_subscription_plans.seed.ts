/**
 * Seed 4 WL subscription plans into PlatformDB (gv_lic_subscription_packages).
 * Run: npx tsx prisma/seeds/platform/2026-04-28_wl_subscription_plans.seed.ts
 *
 * Idempotent: skips plans that already exist by packageCode.
 */
import { PrismaClient } from '@prisma/platform-client';

const db = new PrismaClient({
  datasources: { db: { url: process.env.PLATFORM_DATABASE_URL } },
});

const PLANS = [
  {
    packageCode: 'WL_FREE',
    packageName: 'Free',
    tagline: 'Get started at no cost',
    description: 'Basic CRM for small teams — ideal for evaluation.',
    tier: 0,
    priceMonthlyInr: 0,
    priceYearlyInr: 0,
    trialDays: 0,
    sortOrder: 10,
    hasDedicatedDb: false,
    entityLimits: {
      USERS: { limit: 2 },
      CONTACTS: { limit: 100 },
      LEADS: { limit: 50 },
      FILE_STORAGE_MB: { limit: 100 },
    },
    featureFlags: {
      whiteLabel: false,
      customDomain: false,
      dedicatedDb: false,
      apiAccess: false,
      bulkImport: false,
      workflows: false,
    },
  },
  {
    packageCode: 'WL_STARTER',
    packageName: 'Starter',
    tagline: 'Everything you need to grow',
    description: 'Ideal for small businesses starting with CRM.',
    tier: 1,
    priceMonthlyInr: 999,
    priceYearlyInr: 9990,
    trialDays: 14,
    sortOrder: 20,
    hasDedicatedDb: false,
    entityLimits: {
      USERS: { limit: 10 },
      CONTACTS: { limit: 1000 },
      LEADS: { limit: 500 },
      FILE_STORAGE_MB: { limit: 1024 },
    },
    featureFlags: {
      whiteLabel: false,
      customDomain: false,
      dedicatedDb: false,
      apiAccess: false,
      bulkImport: true,
      workflows: false,
    },
  },
  {
    packageCode: 'WL_PROFESSIONAL',
    packageName: 'Professional',
    tagline: 'Scale with your own brand',
    description: 'Full CRM with custom domain and advanced features.',
    tier: 2,
    priceMonthlyInr: 2999,
    priceYearlyInr: 29990,
    trialDays: 14,
    sortOrder: 30,
    hasDedicatedDb: false,
    entityLimits: {
      USERS: { limit: 50 },
      CONTACTS: { limit: 10000 },
      LEADS: { limit: 5000 },
      FILE_STORAGE_MB: { limit: 10240 },
    },
    featureFlags: {
      whiteLabel: false,
      customDomain: true,
      dedicatedDb: false,
      apiAccess: true,
      bulkImport: true,
      workflows: true,
      advancedReports: true,
    },
  },
  {
    packageCode: 'WL_ENTERPRISE',
    packageName: 'Enterprise',
    tagline: 'Your CRM, your brand, your database',
    description: 'Unlimited users, white-label branding, dedicated database per tenant.',
    tier: 3,
    priceMonthlyInr: 9999,
    priceYearlyInr: 99990,
    trialDays: 30,
    sortOrder: 40,
    hasDedicatedDb: true,
    entityLimits: {
      USERS: { limit: -1 },        // -1 = unlimited
      CONTACTS: { limit: -1 },
      LEADS: { limit: -1 },
      FILE_STORAGE_MB: { limit: 102400 },
    },
    featureFlags: {
      whiteLabel: true,
      customDomain: true,
      dedicatedDb: true,
      apiAccess: true,
      bulkImport: true,
      workflows: true,
      advancedReports: true,
      slaSupport: true,
    },
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const plan of PLANS) {
    const existing = await db.subscriptionPackage.findUnique({
      where: { packageCode: plan.packageCode },
    });
    if (existing) {
      console.log(`  ⏭  ${plan.packageCode} — already exists`);
      skipped++;
      continue;
    }

    await db.subscriptionPackage.create({
      data: {
        packageCode: plan.packageCode,
        packageName: plan.packageName,
        tagline: plan.tagline,
        description: plan.description,
        tier: plan.tier,
        priceMonthlyInr: plan.priceMonthlyInr,
        priceYearlyInr: plan.priceYearlyInr,
        yearlyDiscountPct: plan.priceMonthlyInr === 0 ? 0 : 20,
        trialDays: plan.trialDays,
        sortOrder: plan.sortOrder,
        hasDedicatedDb: plan.hasDedicatedDb,
        entityLimits: plan.entityLimits,
        featureFlags: plan.featureFlags,
        isActive: true,
        isPublic: true,
        applicableTypes: ['ALL'],
        includedModules: [],
        limits: {},
        planLevel: plan.tier,
      },
    });
    console.log(`  ✅ ${plan.packageCode} (${plan.packageName}) — ₹${plan.priceMonthlyInr}/mo`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
