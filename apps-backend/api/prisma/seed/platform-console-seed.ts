/**
 * Platform Console seed — BrandConfig + PartnerRegistry + PartnerVerticalAccess + Verticals
 * Run: npx ts-node -r tsconfig-paths/register prisma/seed/platform-console-seed.ts
 */
import { PlatformConsolePrismaService } from '../../src/modules/platform-console/prisma/platform-console-prisma.service';
import { seedInitialVerticals } from '../../src/modules/platform-console/vertical-manager/seed-verticals';

const db = new PlatformConsolePrismaService();

const BRANDS = [
  {
    brandCode: 'crmsoft',
    brandName: 'CRMSoft',
    displayName: 'CRMSoft — Multi-Vertical SaaS CRM',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    domain: 'crmsoft.com',
    subdomain: 'app',
    contactEmail: 'hello@crmsoft.com',
    description: 'Default CRMSoft brand for Indian SMB market',
    isDefault: true,
    isActive: true,
  },
  {
    brandCode: 'partner-travel-1',
    brandName: 'TravelCRM',
    displayName: 'TravelCRM by CRMSoft',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f59e0b',
    domain: 'travel.crmsoft.com',
    contactEmail: 'travel@crmsoft.com',
    description: 'Travel industry specialized CRM',
    isDefault: false,
    isActive: true,
  },
  {
    brandCode: 'partner-electronic-1',
    brandName: 'ElectroHub CRM',
    displayName: 'ElectroHub CRM by CRMSoft',
    primaryColor: '#e11d48',
    secondaryColor: '#22c55e',
    domain: 'electro.crmsoft.com',
    contactEmail: 'electronic@crmsoft.com',
    description: 'Electronics retail and distribution CRM',
    isDefault: false,
    isActive: true,
  },
];

const PARTNERS = [
  {
    partnerCode: 'travel-01',
    partnerName: 'Travel Partner 1',
    legalName: 'Travel Solutions Pvt Ltd',
    contactEmail: 'travel@partner.com',
    contactPhone: '+91 9876543210',
    businessType: 'industry-specialist',
    industry: 'travel',
    brandCode: 'partner-travel-1',
    description: 'First travel industry partner — pilot program',
    enabledVerticals: ['GENERAL', 'TOURISM'],
  },
  {
    partnerCode: 'electronic-01',
    partnerName: 'Electronic Partner 1',
    legalName: 'Electronic Solutions Pvt Ltd',
    contactEmail: 'electronic@partner.com',
    contactPhone: '+91 9876543211',
    businessType: 'industry-specialist',
    industry: 'electronics',
    brandCode: 'partner-electronic-1',
    description: 'First electronics retail partner — pilot program',
    enabledVerticals: ['GENERAL', 'RETAIL'],
  },
];

async function main() {
  await db.$connect();
  console.log('🌱 Seeding Platform Console...\n');

  // 1. Brand Configs
  console.log('--- Brands ---');
  for (const brand of BRANDS) {
    await db.brandConfig.upsert({
      where: { brandCode: brand.brandCode },
      update: brand,
      create: brand,
    });
    console.log(`  ✅ ${brand.brandName} (${brand.brandCode}) — ${brand.primaryColor}`);
  }

  // 2. Partners
  console.log('\n--- Partners ---');
  for (const { enabledVerticals, ...partnerData } of PARTNERS) {
    const apiKey = `pk_${partnerData.partnerCode}_${Math.random().toString(36).slice(2, 14)}`;
    await db.partnerRegistry.upsert({
      where: { partnerCode: partnerData.partnerCode },
      update: { ...partnerData, isActive: true },
      create: { ...partnerData, apiKey, onboardedAt: new Date() },
    });
    console.log(`  ✅ ${partnerData.partnerName} (${partnerData.partnerCode})`);

    // Enable verticals
    for (const vCode of enabledVerticals) {
      await db.partnerVerticalAccess.upsert({
        where: { partnerCode_verticalCode: { partnerCode: partnerData.partnerCode, verticalCode: vCode } },
        update: { isEnabled: true },
        create: { partnerCode: partnerData.partnerCode, verticalCode: vCode, isEnabled: true },
      });
    }
    console.log(`     Verticals: ${enabledVerticals.join(', ')}`);
  }

  // 3. Verticals (VerticalRegistry)
  console.log('\n--- Verticals ---');
  await seedInitialVerticals(db);
  console.log('  ✅ 7 verticals seeded (GENERAL=ACTIVE, 6×BETA)');

  console.log('\n🎉 Platform Console seed complete!');
  console.log('   3 brand configs, 2 partners, 7 verticals, vertical access configured\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
