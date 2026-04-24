/**
 * Master Vertical Seed Orchestrator
 * Run: npx ts-node -r tsconfig-paths/register prisma/seed/verticals-master.ts
 */
import { PlatformConsolePrismaService } from '../../src/modules/platform-console/prisma/platform-console-prisma.service';
import { seedCRMGeneral } from './verticals/01-crm-general';
import { seedTravel } from './verticals/02-travel';
import { seedElectronic } from './verticals/03-electronic';
import { seedSoftware } from './verticals/04-software';

const db = new PlatformConsolePrismaService();

async function main() {
  await db.$connect();
  console.log('\n🚀 MASTER VERTICAL SEED STARTING...\n');

  await seedCRMGeneral(db);
  console.log('');
  await seedTravel(db);
  console.log('');
  await seedElectronic(db);
  console.log('');
  await seedSoftware(db);

  const [vc, mc, menuC, fc] = await Promise.all([
    db.pcVerticalV2.count(),
    db.pcVerticalModule.count(),
    db.pcVerticalMenu.count(),
    db.pcVerticalFeature.count(),
  ]);

  console.log('\n=====================================');
  console.log('🎉 ALL VERTICALS SEEDED SUCCESSFULLY!');
  console.log('=====================================');
  console.log(`  Verticals : ${vc}`);
  console.log(`  Modules   : ${mc}`);
  console.log(`  Menus     : ${menuC}`);
  console.log(`  Features  : ${fc}`);
  console.log('');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => db.$disconnect());
