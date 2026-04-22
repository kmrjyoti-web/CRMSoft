/**
 * Menu Discovery Script — finds all page.tsx routes in crm-admin
 * that are NOT accessible from any sidebar menu, then creates an
 * "Unmapped (N)" group (isAdminOnly: true) in the DB.
 *
 * Run: node scripts/create-unmapped-menu.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ── Route scanning ───────────────────────────────────────────────

const CRM_APP_DIR = path.resolve(__dirname, '../../UI/crm-admin/src/app/(main)');

function fileToRoute(filePath) {
  // Convert absolute path → route string
  // e.g. .../src/app/(main)/accounts/ledger/page.tsx → /accounts/ledger
  let rel = filePath
    .replace(CRM_APP_DIR, '')
    .replace(/\/page\.tsx$/, '')
    .replace(/\(main\)\/?/, '');

  // Normalize: empty = root
  return rel || '/';
}

function isStaticRoute(route) {
  // Skip dynamic segments ([id], [code], etc.) — those are detail pages
  // Also skip mass-update / mass-delete / edit / new / bulk-import (utility sub-routes)
  const dynamicPattern = /\/\[[^\]]+\]/;
  const utilitySegments = ['/new', '/edit', '/mass-update', '/mass-delete', '/bulk-import', '/oauth-callback', '/visual/new'];
  if (dynamicPattern.test(route)) return false;
  if (utilitySegments.some(s => route.endsWith(s))) return false;
  return true;
}

function scanRoutes(dir) {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;

  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'page.tsx') {
        const route = fileToRoute(fullPath);
        if (isStaticRoute(route)) {
          routes.push(route);
        }
      }
    }
  }

  walk(dir);
  return routes.sort();
}

// ── Category mapping for unmapped routes ─────────────────────────

function getCategory(route) {
  if (route.startsWith('/accounts')) return 'Accounts';
  if (route.startsWith('/admin')) return 'Admin';
  if (route.startsWith('/campaigns')) return 'Communication';
  if (route.startsWith('/communication')) return 'Communication';
  if (route.startsWith('/demos')) return 'CRM';
  if (route.startsWith('/email')) return 'Communication';
  if (route.startsWith('/finance')) return 'Finance';
  if (route.startsWith('/import')) return 'Tools';
  if (route.startsWith('/inventory')) return 'Inventory';
  if (route.startsWith('/master')) return 'Master';
  if (route.startsWith('/notifications')) return 'Settings';
  if (route.startsWith('/onboarding')) return 'Settings';
  if (route.startsWith('/ownership')) return 'Settings';
  if (route.startsWith('/performance')) return 'CRM';
  if (route.startsWith('/plugins')) return 'Tools';
  if (route.startsWith('/post-sales')) return 'Support';
  if (route.startsWith('/pricing')) return 'Master';
  if (route.startsWith('/procurement')) return 'Purchase';
  if (route.startsWith('/products')) return 'Master';
  if (route.startsWith('/recycle-bin')) return 'Tools';
  if (route.startsWith('/reports')) return 'Reports';
  if (route.startsWith('/sales')) return 'Sale';
  if (route.startsWith('/settings')) return 'Settings';
  if (route.startsWith('/support')) return 'Support';
  if (route.startsWith('/whatsapp')) return 'Communication';
  if (route.startsWith('/workflows')) return 'Tools';
  return 'Other';
}

function friendlyName(route) {
  const segment = route.split('/').pop() || route;
  return segment
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  // 1. Find tenant
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (!tenant) { console.error('❌ Default tenant not found'); process.exit(1); }
  const tenantId = tenant.id;
  console.log(`✅ Tenant: ${tenant.name}`);

  // 2. Scan all static routes from filesystem
  const allRoutes = scanRoutes(CRM_APP_DIR);
  console.log(`📂 Scanned ${allRoutes.length} static route pages`);

  // 3. Get all menu routes from DB
  const menus = await prisma.menu.findMany({
    where: { tenantId, isActive: true },
    select: { route: true, code: true },
  });
  // Build set of normalized menu routes (strip query strings for comparison)
  const menuRoutes = new Set(
    menus
      .filter(m => m.route)
      .map(m => m.route.split('?')[0])  // Strip ?type=receipt etc.
  );
  console.log(`📋 Found ${menuRoutes.size} routes in DB menus`);

  // 4. Find unmapped routes
  const unmappedRoutes = allRoutes.filter(r => !menuRoutes.has(r));
  console.log(`⚠️  Found ${unmappedRoutes.length} unmapped routes`);

  if (unmappedRoutes.length === 0) {
    console.log('✅ All routes are mapped!');
    return;
  }

  // Print them
  console.log('\n── Unmapped routes:');
  unmappedRoutes.forEach(r => console.log(`   ${r}`));

  // 5. Delete existing unmapped group (to refresh)
  const existingGroup = await prisma.menu.findFirst({
    where: { tenantId, code: '_UNMAPPED' },
  });
  if (existingGroup) {
    // Delete all children first
    const children = await prisma.menu.findMany({
      where: { tenantId, parentId: existingGroup.id },
      select: { id: true },
    });
    const childIds = children.map(c => c.id);
    if (childIds.length) {
      // Delete L3 (grandchildren)
      await prisma.menu.deleteMany({ where: { parentId: { in: childIds } } });
      // Delete L2 (children = categories)
      await prisma.menu.deleteMany({ where: { id: { in: childIds } } });
    }
    // Delete root group
    await prisma.menu.delete({ where: { id: existingGroup.id } });
    console.log('\n🗑️  Deleted old unmapped group');
  }

  // 6. Group unmapped routes by category
  const byCategory = new Map();
  for (const route of unmappedRoutes) {
    const cat = getCategory(route);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(route);
  }

  // 7. Create root "Unmapped" group (isAdminOnly: true)
  const unmappedGroup = await prisma.menu.create({
    data: {
      tenantId,
      name: `Unmapped (${unmappedRoutes.length})`,
      code: '_UNMAPPED',
      icon: 'alert-circle',
      menuType: 'GROUP',
      sortOrder: 9999,
      isAdminOnly: true,
      isActive: true,
    },
  });
  console.log(`\n✅ Created "Unmapped (${unmappedRoutes.length})" group`);

  // 8. Create sub-groups per category with route items
  let groupOrder = 0;
  let totalItems = 0;

  for (const [category, routes] of [...byCategory.entries()].sort()) {
    const catGroup = await prisma.menu.create({
      data: {
        tenantId,
        name: `${category} (${routes.length})`,
        code: `_UNMAPPED_${category.toUpperCase().replace(/\s+/g, '_')}`,
        icon: getCategoryIcon(category),
        menuType: 'GROUP',
        parentId: unmappedGroup.id,
        sortOrder: groupOrder++,
        isAdminOnly: true,
        isActive: true,
      },
    });

    let itemOrder = 0;
    for (const route of routes.sort()) {
      await prisma.menu.create({
        data: {
          tenantId,
          name: friendlyName(route),
          code: `_UNMAPPED${route.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
          icon: 'file',
          route,
          menuType: 'ITEM',
          parentId: catGroup.id,
          sortOrder: itemOrder++,
          isAdminOnly: true,
          isActive: true,
        },
      });
      totalItems++;
    }
    console.log(`  📁 ${category}: ${routes.length} routes`);
  }

  console.log(`\n✅ Done — ${totalItems} unmapped routes in ${byCategory.size} categories`);
  console.log('   Visible only to SUPER_ADMIN and PLATFORM_ADMIN users.');
}

function getCategoryIcon(category) {
  const icons = {
    Accounts: 'coins',
    Admin: 'shield',
    Communication: 'message-circle',
    CRM: 'users',
    Finance: 'receipt',
    Inventory: 'warehouse',
    Master: 'database',
    Other: 'folder',
    Purchase: 'shopping-cart',
    Reports: 'bar-chart-3',
    Sale: 'indian-rupee',
    Settings: 'settings',
    Support: 'headphones',
    Tools: 'wrench',
  };
  return icons[category] || 'folder';
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
