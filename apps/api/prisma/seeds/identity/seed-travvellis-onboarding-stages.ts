/**
 * M5 Demo Seed — Travvellis-specific onboarding stages for B2B_TRAV_TRAVL_DMC
 *
 * These OVERRIDE global stages for B2B_TRAV_TRAVL_DMC users:
 *   - Removes user_type and sub_user_type (already set at registration via M4)
 *   - Adds travel_specialization (StageTravelSpecialization) before profile_redirect
 *   - Demo hook: same /dashboard URL, different onboarding per brand
 */

import { PrismaClient as PlatformConsoleClient } from '.prisma/platform-console-client';

const pcDb = new PlatformConsoleClient();

const COMBINED_CODE_ID = '37c8a5cc-ff4c-47d3-8201-1a20046f485c'; // B2B_TRAV_TRAVL_DMC

const STAGES = [
  {
    id: 'b5c6d7e8-1111-4a2b-9c3d-ef0123456701',
    stageKey: 'language',
    stageLabel: 'Select Language',
    componentName: 'StageLanguage',
    sortOrder: 1,
    skipIfFieldSet: null,
    required: true,
  },
  {
    id: 'b5c6d7e8-2222-4a2b-9c3d-ef0123456702',
    stageKey: 'email_otp',
    stageLabel: 'Verify Email',
    componentName: 'StageEmailOtp',
    sortOrder: 2,
    skipIfFieldSet: 'emailVerified',
    required: true,
  },
  {
    id: 'b5c6d7e8-3333-4a2b-9c3d-ef0123456703',
    stageKey: 'mobile_otp',
    stageLabel: 'Verify Mobile',
    componentName: 'StageMobileOtp',
    sortOrder: 3,
    skipIfFieldSet: 'mobileVerified',
    required: false,
  },
  {
    id: 'b5c6d7e8-4444-4a2b-9c3d-ef0123456704',
    stageKey: 'travel_specialization',
    stageLabel: 'Travel Specializations',
    componentName: 'StageTravelSpecialization',
    sortOrder: 4,
    skipIfFieldSet: null,
    required: false,
  },
  {
    id: 'b5c6d7e8-5555-4a2b-9c3d-ef0123456705',
    stageKey: 'profile_redirect',
    stageLabel: 'Complete Your Profile',
    componentName: 'StageProfileRedirect',
    sortOrder: 5,
    skipIfFieldSet: null,
    required: true,
  },
];

async function main() {
  console.log('Seeding Travvellis onboarding stages for B2B_TRAV_TRAVL_DMC...');
  let inserted = 0;
  let skipped = 0;

  for (const stage of STAGES) {
    const exists = await (pcDb as any).pcOnboardingStage.findFirst({
      where: { combinedCodeId: COMBINED_CODE_ID, stageKey: stage.stageKey },
    });

    if (exists) {
      console.log(`  SKIP: ${stage.stageKey} (already exists)`);
      skipped++;
      continue;
    }

    await (pcDb as any).pcOnboardingStage.create({
      data: {
        id: stage.id,
        combinedCodeId: COMBINED_CODE_ID,
        stageKey: stage.stageKey,
        stageLabel: stage.stageLabel,
        componentName: stage.componentName,
        sortOrder: stage.sortOrder,
        skipIfFieldSet: stage.skipIfFieldSet,
        required: stage.required,
        isActive: true,
        translations: {},
      },
    });
    console.log(`  INSERT: ${stage.stageKey} → ${stage.componentName}`);
    inserted++;
  }

  console.log(`\n✅ Inserted ${inserted}, skipped ${skipped}`);
  console.log('\nDEMO: Travvellis B2B/DMC users now see travel_specialization stage');
  console.log('      Other brands/codes continue to use global stages');
}

main()
  .catch(console.error)
  .finally(() => pcDb.$disconnect());
