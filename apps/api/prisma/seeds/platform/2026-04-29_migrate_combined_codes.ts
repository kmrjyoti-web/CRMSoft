/**
 * Migration: pc_combined_codes → pc_master_codes + pc_master_code_configs
 *
 * Groups existing combined codes by (partnerId, crmEditionId, brandId, verticalId)
 * to create 1 PcMasterCode per group, then creates PcMasterCodeConfig per combined code.
 * Old records are kept — both tables coexist.
 *
 * Run: npx ts-node prisma/seeds/platform/2026-04-29_migrate_combined_codes.ts
 */

import { PrismaClient as PlatformConsolePrismaClient } from '../../../node_modules/.prisma/platform-console-client';
import { PrismaClient as IdentityPrismaClient } from '../../../node_modules/.prisma/identity-client';

const pcDb = new PlatformConsolePrismaClient({
  datasources: { db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL } },
});

const identityDb = new IdentityPrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function main() {
  await pcDb.$connect();
  await identityDb.$connect();

  const combinedCodes = await pcDb.pcCombinedCode.findMany({ orderBy: { code: 'asc' } });

  if (combinedCodes.length === 0) {
    console.log('No existing combined codes found — nothing to migrate.');
    return;
  }

  console.log(`Found ${combinedCodes.length} combined codes to migrate.`);

  // Pre-load lookup tables
  const [partners, editions, subTypes] = await Promise.all([
    pcDb.pcPartner.findMany({ select: { id: true, code: true } }),
    identityDb.gvCfgVertical.findMany({ select: { id: true, code: true } }),
    pcDb.pcSubType.findMany({ select: { id: true, shortCode: true, code: true } }),
  ]);

  const partnerMap = new Map(partners.map((p) => [p.id, p.code]));
  const editionMap = new Map(editions.map((e) => [e.id, e.code]));
  const subTypeMap = new Map(subTypes.map((s) => [s.id, s.shortCode]));

  // Group by (partnerId, crmEditionId, brandId, verticalId)
  const groups = new Map<string, typeof combinedCodes>();
  for (const cc of combinedCodes) {
    const key = `${cc.partnerId}|${cc.crmEditionId}|${cc.brandId}|${cc.verticalId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cc);
  }

  let masterCount = 0;
  let configCount = 0;
  let skippedMasters = 0;
  let skippedConfigs = 0;

  for (const [key, codes] of groups.entries()) {
    const first = codes[0];
    const partnerCode = partnerMap.get(first.partnerId) ?? first.partnerId;
    const editionCode = editionMap.get(first.crmEditionId) ?? first.crmEditionId;
    const brandCode = first.brandId; // brandId stores the code string
    const verticalCode = first.verticalId; // verticalId stores the code string

    const masterCode = `${partnerCode}_${editionCode}_${brandCode}_${verticalCode}`;
    const displayName = `${brandCode} / ${verticalCode}`;

    // Create PcMasterCode (skip if already exists)
    let master = await pcDb.pcMasterCode.findUnique({ where: { masterCode } });
    if (!master) {
      master = await pcDb.pcMasterCode.create({
        data: {
          masterCode,
          partnerCode,
          editionCode,
          brandCode,
          verticalCode,
          displayName,
          isActive: true,
        },
      });
      masterCount++;
      console.log(`  ✅ Created master: ${masterCode}`);
    } else {
      skippedMasters++;
      console.log(`  ⏭  Master already exists: ${masterCode}`);
    }

    // Create PcMasterCodeConfig per combined code
    for (const cc of codes) {
      const subTypeCode = subTypeMap.get(cc.subTypeId) ?? cc.subTypeId;
      const resolvedCode = cc.code;

      const existing = await pcDb.pcMasterCodeConfig.findUnique({ where: { resolvedCode } });
      if (existing) {
        skippedConfigs++;
        console.log(`    ⏭  Config already exists: ${resolvedCode}`);
        continue;
      }

      // Copy reg fields from pcRegistrationField rows
      const regFields = await pcDb.pcRegistrationField.findMany({
        where: { combinedCodeId: cc.id, isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          fieldKey: true, fieldType: true, label: true,
          placeholder: true, helpText: true, required: true,
          options: true, validation: true, showWhen: true, sortOrder: true,
        },
      });

      // Copy onboarding stages
      const stages = await pcDb.pcOnboardingStage.findMany({
        where: { combinedCodeId: cc.id, isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          stageKey: true, stageLabel: true, componentName: true,
          sortOrder: true, required: true, skipIfFieldSet: true,
        },
      });

      await pcDb.pcMasterCodeConfig.create({
        data: {
          masterCodeId: master.id,
          userTypeCode: cc.userType,
          subTypeCode,
          resolvedCode,
          displayName: cc.displayName,
          extraRegFields: regFields as any,
          overrideOnboardingStages: stages.length > 0 ? (stages as any) : undefined,
          isActive: cc.isActive,
        },
      });

      // If first config under this master, also populate commonOnboardingStages
      if (configCount === 0 && stages.length > 0) {
        await pcDb.pcMasterCode.update({
          where: { id: master.id },
          data: { commonOnboardingStages: stages as any },
        });
      }

      configCount++;
      console.log(`    ✅ Created config: ${resolvedCode} (${cc.userType}/${subTypeCode})`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Migrated ${combinedCodes.length} combined codes into`);
  console.log(`  ${masterCount} new master codes (${skippedMasters} already existed)`);
  console.log(`  ${configCount} new configs (${skippedConfigs} already existed)`);
  console.log('  Old pc_combined_codes table KEPT — not deleted');
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await pcDb.$disconnect();
    await identityDb.$disconnect();
  });
