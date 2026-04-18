/**
 * seed-identity.ts — IdentityDB seed script
 *
 * Seeds admin user, roles, and permissions into IdentityDB.
 * Safe to run multiple times (upsert-based).
 *
 * Usage:
 *   pnpm seed:identity
 *   npx ts-node --transpile-only prisma/seeds/identity/seed-identity.ts
 */

import { PrismaClient } from '@prisma/identity-client';
import * as bcrypt from 'bcrypt';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

const TENANT_ID = 'default-tenant-00000000-0000-0000-0000-000000000001';
const TENANT_SLUG = 'default';

async function main() {
  console.log('🌱 Seeding IdentityDB...\n');

  // ─── SUPER ADMIN (no tenantId) ───
  const superAdminPw = await bcrypt.hash('SuperAdmin@123', 12);
  await identity.superAdmin.upsert({
    where: { email: 'platform@crm.com' },
    update: {},
    create: { email: 'platform@crm.com', password: superAdminPw, firstName: 'Platform', lastName: 'Admin' },
  });
  console.log('✅ SuperAdmin: platform@crm.com / SuperAdmin@123');

  // ─── DEFAULT TENANT ───
  const tenant = await identity.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: { id: TENANT_ID, name: 'Default Organization', slug: TENANT_SLUG, status: 'ACTIVE', onboardingStep: 'COMPLETED' },
  });
  const tenantId = tenant.id;
  console.log(`✅ Tenant: ${TENANT_SLUG} (id: ${tenantId})`);

  // ─── PERMISSIONS (module × action combos) ───
  const modules = [
    'contacts', 'raw_contacts', 'organizations', 'leads', 'activities', 'demos',
    'tour-plans', 'quotations', 'invoices', 'payments', 'installations', 'trainings',
    'licenses', 'ledgers', 'support-tickets', 'communications', 'users', 'roles',
    'lookups', 'ownership', 'reports', 'departments', 'designations', 'brands',
    'manufacturers', 'packages', 'locations', 'menus', 'custom_fields', 'products',
    'product_pricing', 'workflows', 'follow-ups', 'reminders', 'recurrence',
    'calendar', 'dashboard', 'analytics', 'performance', 'audit', 'settings',
    'wallet', 'notifications',
  ];
  const actions = ['create', 'read', 'update', 'delete', 'export'];
  let permCount = 0;
  for (const m of modules) {
    for (const a of actions) {
      await identity.permission.upsert({
        where: { module_action: { module: m, action: a } },
        update: {},
        create: { module: m, action: a, description: `${a} ${m}` },
      });
      permCount++;
    }
  }
  console.log(`✅ ${permCount} permissions`);

  // ─── ROLES ───
  const roleDefs = [
    { name: 'SUPER_ADMIN', displayName: 'Super Admin', description: 'Full access to all modules', isSystem: true, level: 0, canManageLevels: [1, 2, 3, 4, 5, 6] },
    { name: 'ADMIN', displayName: 'Admin', description: 'Tenant administrator', isSystem: true, level: 1, canManageLevels: [2, 3, 4, 5, 6] },
    { name: 'MANAGER', displayName: 'Manager', description: 'Team manager', isSystem: false, level: 2, canManageLevels: [3, 4, 5] },
    { name: 'TEAM_LEAD', displayName: 'Team Lead', description: 'Team lead / supervisor', isSystem: false, level: 3, canManageLevels: [4, 5] },
    { name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', description: 'Field sales representative', isSystem: false, level: 4, canManageLevels: [] },
    { name: 'MARKETING_STAFF', displayName: 'Marketing Staff', description: 'Marketing team member', isSystem: false, level: 4, canManageLevels: [] },
    { name: 'SUPPORT_AGENT', displayName: 'Support Agent', description: 'Customer support agent', isSystem: false, level: 4, canManageLevels: [] },
    { name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: 'Post-sales account manager', isSystem: false, level: 4, canManageLevels: [] },
    { name: 'TELECALLER', displayName: 'Telecaller', description: 'Outbound calling team', isSystem: false, level: 5, canManageLevels: [] },
    { name: 'CUSTOMER', displayName: 'Customer', description: 'Customer portal access', isSystem: false, level: 5, canManageLevels: [] },
    { name: 'REFERRAL_PARTNER', displayName: 'Referral Partner', description: 'Partner portal access', isSystem: false, level: 5, canManageLevels: [] },
    { name: 'VIEWER', displayName: 'Viewer', description: 'Read-only access', isSystem: false, level: 6, canManageLevels: [] },
  ];

  const roleMap: Record<string, string> = {};
  for (const rd of roleDefs) {
    const role = await identity.role.upsert({
      where: { tenantId_name: { tenantId, name: rd.name } },
      update: { level: rd.level, canManageLevels: rd.canManageLevels },
      create: { tenantId, name: rd.name, displayName: rd.displayName, description: rd.description, isSystem: rd.isSystem, level: rd.level, canManageLevels: rd.canManageLevels },
    });
    roleMap[rd.name] = role.id;
  }
  console.log(`✅ ${roleDefs.length} roles`);

  // ─── ASSIGN ALL PERMISSIONS TO SUPER_ADMIN + ADMIN ───
  const allPerms = await identity.permission.findMany();
  const fullAccessRoles = ['SUPER_ADMIN', 'ADMIN'];
  for (const roleName of fullAccessRoles) {
    const roleId = roleMap[roleName];
    for (const p of allPerms) {
      await identity.rolePermission.upsert({
        where: { tenantId_roleId_permissionId: { tenantId, roleId, permissionId: p.id } },
        update: {},
        create: { tenantId, roleId, permissionId: p.id },
      });
    }
  }

  // MANAGER gets most modules (read + write, no admin)
  const MANAGER_MODULES = ['contacts', 'raw_contacts', 'organizations', 'leads', 'activities',
    'demos', 'tour-plans', 'quotations', 'invoices', 'payments', 'installations', 'trainings',
    'support-tickets', 'communications', 'reports', 'dashboard', 'analytics', 'performance',
    'follow-ups', 'reminders', 'recurrence', 'calendar', 'products', 'product_pricing',
    'custom_fields', 'wallet', 'notifications'];
  const SALES_MODULES = ['contacts', 'raw_contacts', 'organizations', 'leads', 'activities',
    'demos', 'tour-plans', 'quotations', 'follow-ups', 'reminders', 'recurrence', 'calendar',
    'dashboard', 'communications', 'products', 'product_pricing', 'notifications'];
  const SUPPORT_MODULES = ['contacts', 'organizations', 'support-tickets', 'communications',
    'installations', 'trainings', 'dashboard', 'calendar', 'notifications'];

  const mgrPerms = allPerms.filter(p => MANAGER_MODULES.includes(p.module));
  const salesPerms = allPerms.filter(p => SALES_MODULES.includes(p.module));
  const supportPerms = allPerms.filter(p => SUPPORT_MODULES.includes(p.module));

  const limitedRoles: Array<{ name: string; perms: typeof allPerms }> = [
    { name: 'MANAGER', perms: mgrPerms },
    { name: 'TEAM_LEAD', perms: mgrPerms },
    { name: 'SALES_EXECUTIVE', perms: salesPerms },
    { name: 'MARKETING_STAFF', perms: salesPerms },
    { name: 'SUPPORT_AGENT', perms: supportPerms },
    { name: 'ACCOUNT_MANAGER', perms: supportPerms },
  ];
  for (const { name, perms } of limitedRoles) {
    const roleId = roleMap[name];
    for (const p of perms) {
      await identity.rolePermission.upsert({
        where: { tenantId_roleId_permissionId: { tenantId, roleId, permissionId: p.id } },
        update: {},
        create: { tenantId, roleId, permissionId: p.id },
      });
    }
  }
  console.log(`✅ Permissions assigned to all roles`);

  // ─── ADMIN USER ───
  const pw = await bcrypt.hash('Admin@123', 12);
  const saRoleId = roleMap['SUPER_ADMIN'];
  const adminUser = await identity.user.upsert({
    where: { tenantId_email: { tenantId, email: 'admin@crm.com' } },
    update: {},
    create: {
      tenantId,
      email: 'admin@crm.com',
      password: pw,
      firstName: 'System',
      lastName: 'Admin',
      roleId: saRoleId,
      userType: 'ADMIN',
      emailVerified: true,
    },
  });

  // ─── SAMPLE EMPLOYEES ───
  const sampleUsers = [
    { email: 'manager@crm.com', firstName: 'Sales', lastName: 'Manager', roleName: 'MANAGER' },
    { email: 'sales1@crm.com', firstName: 'Raj', lastName: 'Patel', roleName: 'SALES_EXECUTIVE' },
    { email: 'marketing1@crm.com', firstName: 'Priya', lastName: 'Shah', roleName: 'MARKETING_STAFF' },
    { email: 'support1@crm.com', firstName: 'Ravi', lastName: 'Kumar', roleName: 'SUPPORT_AGENT' },
  ];
  for (const u of sampleUsers) {
    await identity.user.upsert({
      where: { tenantId_email: { tenantId, email: u.email } },
      update: {},
      create: {
        tenantId,
        email: u.email,
        password: pw,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: roleMap[u.roleName],
        userType: 'EMPLOYEE',
        createdBy: adminUser.id,
      },
    });
  }
  console.log(`✅ ${sampleUsers.length + 1} users seeded`);

  // ─── SUMMARY ───
  const counts = await Promise.all([
    identity.user.count({ where: { tenantId } }),
    identity.role.count({ where: { tenantId } }),
    identity.permission.count(),
    identity.superAdmin.count(),
  ]);
  console.log(`\n📊 IdentityDB Summary:`);
  console.log(`   Users:        ${counts[0]}`);
  console.log(`   Roles:        ${counts[1]}`);
  console.log(`   Permissions:  ${counts[2]}`);
  console.log(`   SuperAdmins:  ${counts[3]}`);
  console.log('\n🔑 Credentials:');
  console.log('   platform@crm.com     / SuperAdmin@123  (SuperAdmin)');
  console.log('   admin@crm.com        / Admin@123       (SUPER_ADMIN role)');
  console.log('   manager@crm.com      / Admin@123       (MANAGER)');
  console.log('   sales1@crm.com       / Admin@123       (SALES_EXECUTIVE)');
  console.log('   marketing1@crm.com   / Admin@123       (MARKETING_STAFF)');
  console.log('   support1@crm.com     / Admin@123       (SUPPORT_AGENT)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => identity.$disconnect());
