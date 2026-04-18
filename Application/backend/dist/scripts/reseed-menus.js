"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const menu_seed_data_1 = require("../src/modules/core/identity/menus/presentation/menu-seed-data");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
    if (!tenant) {
        console.error('❌ Default tenant not found');
        process.exit(1);
    }
    const tenantId = tenant.id;
    console.log(`✅ Tenant: ${tenant.name} (${tenantId})`);
    const level2 = await prisma.menu.findMany({
        where: { parentId: { not: null }, tenantId },
        select: { id: true },
    });
    const l2ids = level2.map((m) => m.id);
    if (l2ids.length > 0) {
        const del3 = await prisma.menu.deleteMany({
            where: { parentId: { in: l2ids }, tenantId },
        });
        console.log(`  Deleted ${del3.count} level-3 menus`);
    }
    const del2 = await prisma.menu.deleteMany({
        where: { parentId: { not: null }, tenantId },
    });
    console.log(`  Deleted ${del2.count} level-2 menus`);
    const del1 = await prisma.menu.deleteMany({ where: { tenantId } });
    console.log(`  Deleted ${del1.count} level-1 menus`);
    let count = 0;
    async function createMenu(item, parentId, sortOrder) {
        const created = await prisma.menu.create({
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
    async function seedRecursive(items, parentId) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const created = await createMenu(item, parentId, i);
            if (item.children && item.children.length > 0) {
                await seedRecursive(item.children, created.id);
            }
        }
    }
    await seedRecursive(menu_seed_data_1.MENU_SEED_DATA, null);
    console.log(`✅ Seeded ${count} menus`);
    console.log('\n🔍 Running menu discovery to restore unmapped group...');
    const { execSync } = require('child_process');
    execSync('node scripts/create-unmapped-menu.js', { stdio: 'inherit', cwd: __dirname + '/..' });
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=reseed-menus.js.map