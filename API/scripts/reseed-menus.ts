/**
 * Direct DB menu re-seed script — run with:
 *   npx ts-node -r tsconfig-paths/register scripts/reseed-menus.ts
 *
 * Deletes all existing menus for the default tenant, then re-creates
 * them from MENU_SEED_DATA (3-level structure).
 */
import { PrismaClient } from '@prisma/client';
import { MENU_SEED_DATA } from '../src/modules/menus/presentation/menu-seed-data';

interface MenuSeedItem {
  name: string;
  code: string;
  icon?: string;
  route?: string;
  menuType?: string;
  permissionModule?: string;
  permissionAction?: string;
  badgeColor?: string;
  badgeText?: string;
  openInNewTab?: boolean;
  children?: MenuSeedItem[];
}

const prisma = new PrismaClient();

async function main() {
  // Find default tenant
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (!tenant) {
    console.error('❌ Default tenant not found');
    process.exit(1);
  }
  const tenantId = tenant.id;
  console.log(`✅ Tenant: ${tenant.name} (${tenantId})`);

  // Delete all existing menus for this tenant (children first)
  const level2 = await prisma.menu.findMany({
    where: { parentId: { not: null }, tenantId },
    select: { id: true },
  });
  const l2ids = level2.map((m) => m.id);

  if (l2ids.length > 0) {
    const del3 = await (prisma.menu as any).deleteMany({
      where: { parentId: { in: l2ids }, tenantId },
    });
    console.log(`  Deleted ${del3.count} level-3 menus`);
  }
  const del2 = await (prisma.menu as any).deleteMany({
    where: { parentId: { not: null }, tenantId },
  });
  console.log(`  Deleted ${del2.count} level-2 menus`);

  const del1 = await (prisma.menu as any).deleteMany({ where: { tenantId } });
  console.log(`  Deleted ${del1.count} level-1 menus`);

  // Re-create from seed data (3 levels)
  let count = 0;

  async function createMenu(
    item: MenuSeedItem,
    parentId: string | null,
    sortOrder: number,
  ): Promise<any> {
    const created = await (prisma.menu as any).create({
      data: {
        tenantId,
        name: item.name,
        code: item.code,
        icon: item.icon ?? null,
        route: item.route ?? null,
        parentId,
        sortOrder,
        menuType: item.menuType ?? 'ITEM',
        permissionModule: item.permissionModule ?? null,
        permissionAction: item.permissionAction ?? (item.permissionModule ? 'read' : null),
        badgeColor: item.badgeColor ?? null,
        badgeText: item.badgeText ?? null,
        openInNewTab: item.openInNewTab ?? false,
      },
    });
    count++;
    return created;
  }

  for (let i = 0; i < (MENU_SEED_DATA as MenuSeedItem[]).length; i++) {
    const item = (MENU_SEED_DATA as MenuSeedItem[])[i];
    const parent = await createMenu(item, null, i);

    if (item.children) {
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        const childMenu = await createMenu(child, parent.id, j);

        if (child.children) {
          for (let k = 0; k < child.children.length; k++) {
            await createMenu(child.children[k], childMenu.id, k);
          }
        }
      }
    }
  }

  console.log(`✅ Seeded ${count} menus`);

  // Re-run discovery to restore the _UNMAPPED admin group
  console.log('\n🔍 Running menu discovery to restore unmapped group...');
  const { execSync } = require('child_process');
  execSync('node scripts/create-unmapped-menu.js', { stdio: 'inherit', cwd: __dirname + '/..' });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
