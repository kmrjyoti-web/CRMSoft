/**
 * Seed IT/Software Services sub-types for all four user types (B2B, B2C, IND_SP, IND_EE).
 * Run: npx tsx prisma/seeds/platform/2026-04-28_it_services_subtypes.seed.ts
 *
 * Prerequisite: pc_vertical row with typeCode = 'IT_SERVICES' must exist in platformdb.
 */
import { PrismaClient as PlatformConsolePrismaClient } from '.prisma/platform-console-client';
import { PrismaClient as PlatformPrismaClient } from '.prisma/platform-client';

const pcDb = new PlatformConsolePrismaClient({
  datasources: { db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL } },
});
const platformDb = new PlatformPrismaClient({
  datasources: { db: { url: process.env.PLATFORM_DATABASE_URL } },
});

const IT_SERVICES_TYPE_CODE = 'IT_SERVICES';

const SUBTYPES = [
  // ── B2B ───────────────────────────────────────────────────────────────────
  {
    code: 'SW_B2B_SFTV', shortCode: 'SFTV', name: 'Software Vendor',
    description: 'ISV / SaaS company selling to businesses',
    userType: 'B2B', allowedBusinessModes: ['B2B', 'B2C'], defaultBusinessMode: 'B2B', businessModeRequired: true, sortOrder: 1,
  },
  {
    code: 'SW_B2B_ITAG', shortCode: 'ITAG', name: 'IT Agency / MSP',
    description: 'Managed service provider or outsourcing agency',
    userType: 'B2B', allowedBusinessModes: ['B2B'], defaultBusinessMode: 'B2B', businessModeRequired: false, sortOrder: 2,
  },
  {
    code: 'SW_B2B_SYSI', shortCode: 'SYSI', name: 'System Integrator',
    description: 'ERP/CRM implementation and integration partner',
    userType: 'B2B', allowedBusinessModes: ['B2B'], defaultBusinessMode: 'B2B', businessModeRequired: false, sortOrder: 3,
  },
  // ── B2C ───────────────────────────────────────────────────────────────────
  {
    code: 'SW_B2C_CAPP', shortCode: 'CAPP', name: 'Consumer App / Product',
    description: 'B2C digital product or mobile app company',
    userType: 'B2C', allowedBusinessModes: ['B2C'], defaultBusinessMode: 'B2C', businessModeRequired: false, sortOrder: 1,
  },
  // ── IND_SP ────────────────────────────────────────────────────────────────
  {
    code: 'SW_SP_FRLN', shortCode: 'FRLN', name: 'Freelancer',
    description: 'Independent freelance developer or designer',
    userType: 'IND_SP', allowedBusinessModes: ['B2B', 'B2C'], defaultBusinessMode: 'B2C', businessModeRequired: true, sortOrder: 1,
  },
  {
    code: 'SW_SP_ITCO', shortCode: 'ITCO', name: 'IT Consultant',
    description: 'Independent IT strategy or technical consultant',
    userType: 'IND_SP', allowedBusinessModes: ['B2B'], defaultBusinessMode: 'B2B', businessModeRequired: false, sortOrder: 2,
  },
  // ── IND_EE ────────────────────────────────────────────────────────────────
  {
    code: 'SW_EE_DVLP', shortCode: 'DVLP', name: 'Developer',
    description: 'Software developer / engineer',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 1,
  },
  {
    code: 'SW_EE_DSGN', shortCode: 'DSGN', name: 'Designer',
    description: 'UI/UX or product designer',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 2,
  },
  {
    code: 'SW_EE_MKTG', shortCode: 'MKTG', name: 'Marketing Professional',
    description: 'Growth, content, or digital marketing specialist',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 3,
  },
  {
    code: 'SW_EE_SLSM', shortCode: 'SLSM', name: 'Sales Professional',
    description: 'Sales executive or account manager',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 4,
  },
  {
    code: 'SW_EE_MNGR', shortCode: 'MNGR', name: 'Manager / Team Lead',
    description: 'Engineering manager, product manager, or team lead',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 5,
  },
  {
    code: 'SW_EE_INTR', shortCode: 'INTR', name: 'Intern / Fresher',
    description: 'Student intern or recent graduate',
    userType: 'IND_EE', allowedBusinessModes: [], defaultBusinessMode: undefined, businessModeRequired: false, sortOrder: 6,
  },
];

async function main() {
  const vertical = await platformDb.pcVertical.findUnique({
    where: { typeCode: IT_SERVICES_TYPE_CODE },
  });
  if (!vertical) {
    console.error(`❌ Vertical '${IT_SERVICES_TYPE_CODE}' not found in platformdb — run vertical seed first`);
    process.exit(1);
  }
  console.log(`✅ Vertical: ${vertical.typeCode} (${vertical.id})`);

  let created = 0;
  let skipped = 0;
  for (const st of SUBTYPES) {
    const existing = await pcDb.pcSubType.findUnique({ where: { code: st.code } });
    if (existing) {
      console.log(`  ⏭  ${st.code} — already exists`);
      skipped++;
      continue;
    }
    await pcDb.pcSubType.create({
      data: {
        code: st.code,
        shortCode: st.shortCode,
        name: st.name,
        description: st.description,
        verticalId: vertical.id,
        userType: st.userType,
        allowedBusinessModes: st.allowedBusinessModes,
        defaultBusinessMode: st.defaultBusinessMode ?? null,
        businessModeRequired: st.businessModeRequired,
        sortOrder: st.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✅ ${st.code} (${st.userType})`);
    created++;
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await pcDb.$disconnect(); await platformDb.$disconnect(); });
