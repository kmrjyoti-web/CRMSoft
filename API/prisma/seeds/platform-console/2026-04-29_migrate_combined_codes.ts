/**
 * Sprint 5.1 — Migrate existing pc_combined_codes → pc_master_codes + pc_master_code_configs
 *
 * Safe to re-run: uses upsert throughout.
 * Run with: ts-node prisma/seeds/platform-console/2026-04-29_migrate_combined_codes.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Parse a legacy combined-code string into its constituent parts.
 * Expected formats (best-effort):
 *   {USERTYPE}_{EDITION}_{BRAND}_{SUBTYPE}    e.g. B2B_SW_DFLT_CAPP
 *   {USERTYPE}_{EDITION}_{BRAND}              e.g. B2C_SW_DFLT
 *
 * Returns null when the code cannot be parsed.
 */
function parseLegacyCode(code: string): {
  userTypeCode: string;
  editionCode: string;
  brandCode: string;
  subTypeCode: string | null;
} | null {
  const parts = code.split('_');
  if (parts.length < 3) return null;
  const [userTypeCode, editionCode, brandCode, ...rest] = parts;
  return {
    userTypeCode,
    editionCode,
    brandCode,
    subTypeCode: rest.length > 0 ? rest.join('_') : null,
  };
}

async function main() {
  // Check if the old table exists (guard against fresh installs)
  const tableExists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND   table_name   = 'pc_combined_codes'
    ) AS exists
  `;

  if (!tableExists[0]?.exists) {
    console.log('ℹ️  pc_combined_codes table does not exist — nothing to migrate.');
    console.log('Migrated 0 combined codes into 0 master codes with 0 configs');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyCodes: any[] = await prisma.$queryRaw`SELECT * FROM pc_combined_codes`;

  if (legacyCodes.length === 0) {
    console.log('ℹ️  pc_combined_codes is empty — nothing to migrate.');
    console.log('Migrated 0 combined codes into 0 master codes with 0 configs');
    return;
  }

  console.log(`Found ${legacyCodes.length} legacy combined codes — starting migration…`);

  // Group by inferred partner+edition+brand+vertical key
  // Since legacy codes don't carry a partnerCode or verticalCode, we default to
  // DFLT_PARTNER and DFLT_VERTICAL unless the code or a related metadata field
  // carries that info.
  type MasterGroup = {
    partnerCode: string;
    editionCode: string;
    brandCode: string;
    verticalCode: string;
    displayName: string;
    commonRegFields: unknown[];
    commonOnboardingStages: unknown[];
    children: typeof legacyCodes;
  };

  const groups = new Map<string, MasterGroup>();

  for (const row of legacyCodes) {
    const parsed = parseLegacyCode(row.code ?? row.combined_code ?? '');
    if (!parsed) {
      console.warn(`  ⚠️  Skipping unparseable code: ${row.code ?? row.combined_code}`);
      continue;
    }

    const partnerCode: string = row.partner_code ?? 'DFLT';
    const verticalCode: string = row.vertical_code ?? 'GEN';
    const key = `${partnerCode}_${parsed.editionCode}_${parsed.brandCode}_${verticalCode}`;

    if (!groups.has(key)) {
      groups.set(key, {
        partnerCode,
        editionCode: parsed.editionCode,
        brandCode: parsed.brandCode,
        verticalCode,
        displayName: row.display_name ?? key,
        commonRegFields: [],
        commonOnboardingStages: Array.isArray(row.onboarding_stages) ? row.onboarding_stages : [],
        children: [],
      });
    }

    groups.get(key)!.children.push({ ...row, _parsed: parsed });
  }

  let masterCount = 0;
  let configCount = 0;

  for (const [masterCodeStr, group] of groups) {
    const master = await prisma.pcMasterCode.upsert({
      where: { masterCode: masterCodeStr },
      create: {
        masterCode: masterCodeStr,
        partnerCode: group.partnerCode,
        editionCode: group.editionCode,
        brandCode: group.brandCode,
        verticalCode: group.verticalCode,
        displayName: group.displayName,
        commonRegFields: group.commonRegFields as never,
        commonOnboardingStages: group.commonOnboardingStages as never,
      },
      update: {},
    });
    masterCount++;

    for (const child of group.children) {
      const { userTypeCode, editionCode, brandCode, subTypeCode } = child._parsed;
      const resolvedCode: string = child.code ?? child.combined_code;

      await prisma.pcMasterCodeConfig.upsert({
        where: { resolvedCode },
        create: {
          masterCodeId: master.id,
          userTypeCode,
          subTypeCode: subTypeCode ?? undefined,
          resolvedCode,
          displayName: child.display_name ?? resolvedCode,
          extraRegFields: Array.isArray(child.registration_fields)
            ? (child.registration_fields as never)
            : ([] as never),
          overrideOnboardingStages: child.onboarding_stages ?? undefined,
        },
        update: {},
      });
      configCount++;
    }
  }

  console.log(
    `✅  Migrated ${legacyCodes.length} combined codes into ${masterCount} master codes with ${configCount} configs`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
