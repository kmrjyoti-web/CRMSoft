import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedLeadWorkflow } from './seeds/workflow-lead-pipeline.seed';
import { seedDemoWorkflow } from './seeds/workflow-demo.seed';
import { seedTourPlanWorkflow } from './seeds/workflow-tour-plan.seed';
import { seedQuotationWorkflow } from './seeds/workflow-quotation.seed';
import { seedReportDefinitions } from './seeds/report-definitions.seed';
import { seedSyncPolicies } from './seeds/sync-policies.seed';
import { seedTenantConfigs } from './seeds/tenant-configs.seed';
import { seedRawContacts } from './seeds/raw-contacts.seed';
import { seedTaskEngine } from './seeds/task-engine.seed';
import { seedPermissionTemplates } from './seeds/permission-templates.seed';
import { seedDemoData } from './seeds/demo-data.seed';
import { seedModulesAndPackages } from './seeds/module-package.seed';
import { seedInventory } from './seeds/inventory.seed';
import { seedShortcutDefinitions } from './seeds/shortcut-definitions.seed';
import { seedAmcWarranty } from './seeds/amc-warranty.seed';
import { seedCalendarHighlights } from './seeds/calendar-highlights.seed';
import { LOOKUP_SEED_DATA } from '../src/modules/core/platform/lookups/data/lookup-seed-data';
import { MENU_SEED_DATA } from '../src/modules/core/identity/menus/presentation/menu-seed-data';
import { BUSINESS_TYPE_SEED_DATA } from '../src/modules/softwarevendor/business-type/services/business-type-seed-data';
import type { MenuSeedItem } from '../src/modules/core/identity/menus/application/commands/bulk-seed-menus/bulk-seed-menus.command';

const prisma = new PrismaClient();

/** Upsert a single menu item by code, scoped to a tenant. */
async function upsertMenu(item: MenuSeedItem, parentId: string | null, sortOrder: number, tenantId: string) {
  const existing = await prisma.menu.findFirst({ where: { tenantId, code: item.code } });
  const data = {
    name: item.name, icon: item.icon, route: item.route, parentId, sortOrder,
    menuType: item.menuType ?? 'ITEM',
    permissionModule: item.permissionModule,
    permissionAction: item.permissionAction ?? (item.permissionModule ? 'read' : undefined),
    badgeColor: item.badgeColor, badgeText: item.badgeText,
    openInNewTab: item.openInNewTab ?? false,
  };
  if (existing) {
    return prisma.menu.update({ where: { id: existing.id }, data });
  }
  return prisma.menu.create({ data: { ...data, tenantId, code: item.code } });
}

/** Seed all menus from MENU_SEED_DATA (2 levels), scoped to the given tenant. */
async function seedMenus(tenantId: string) {
  // Clean up orphaned menus with empty tenantId (from older seed runs)
  const orphanedCount = await prisma.menu.count({ where: { tenantId: '' } });
  if (orphanedCount > 0) {
    await prisma.menu.deleteMany({ where: { tenantId: '', parentId: { not: null } } });
    await prisma.menu.deleteMany({ where: { tenantId: '' } });
    console.log(`🗑️  Cleaned up ${orphanedCount} orphaned menus (empty tenantId)`);
  }

  let count = 0;
  for (let i = 0; i < MENU_SEED_DATA.length; i++) {
    const item = MENU_SEED_DATA[i];
    const parent = await upsertMenu(item, null, i, tenantId);
    count++;
    if (item.children) {
      for (let j = 0; j < item.children.length; j++) {
        await upsertMenu(item.children[j], parent.id, j, tenantId);
        count++;
      }
    }
  }
  return count;
}

async function main() {
  console.log('🌱 Seeding...\n');

  // ─── PLANS (global, no tenantId) ───
  const freePlan = await prisma.plan.upsert({
    where: { code: 'FREE' },
    update: {},
    create: { name: 'Free', code: 'FREE', interval: 'MONTHLY', price: 0, maxUsers: 3, maxContacts: 100, maxLeads: 50, maxProducts: 20, maxStorage: 100, features: [] },
  });
  const starterPlan = await prisma.plan.upsert({
    where: { code: 'STARTER' },
    update: {},
    create: { name: 'Starter', code: 'STARTER', interval: 'MONTHLY', price: 999, maxUsers: 10, maxContacts: 1000, maxLeads: 500, maxProducts: 100, maxStorage: 1024, features: ['BULK_IMPORT', 'BULK_EXPORT'], sortOrder: 1 },
  });
  const businessPlan = await prisma.plan.upsert({
    where: { code: 'BUSINESS' },
    update: {},
    create: { name: 'Business', code: 'BUSINESS', interval: 'MONTHLY', price: 2999, maxUsers: 50, maxContacts: 10000, maxLeads: 5000, maxProducts: 500, maxStorage: 5120, features: ['BULK_IMPORT', 'BULK_EXPORT', 'DOCUMENTS', 'WORKFLOWS', 'CUSTOM_FIELDS', 'EMAIL_INTEGRATION'], sortOrder: 2 },
  });
  const enterprisePlan = await prisma.plan.upsert({
    where: { code: 'ENTERPRISE' },
    update: {},
    create: { name: 'Enterprise', code: 'ENTERPRISE', interval: 'MONTHLY', price: 9999, maxUsers: 500, maxContacts: 100000, maxLeads: 50000, maxProducts: 5000, maxStorage: 51200, features: ['WHATSAPP_INTEGRATION', 'EMAIL_INTEGRATION', 'BULK_IMPORT', 'BULK_EXPORT', 'DOCUMENTS', 'WORKFLOWS', 'QUOTATION_AI', 'ADVANCED_REPORTS', 'CUSTOM_FIELDS', 'API_ACCESS'], sortOrder: 3 },
  });
  console.log('✅ 4 plans');

  // ─── DEFAULT TENANT (global) ───
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'Default Organization', slug: 'default', status: 'ACTIVE', onboardingStep: 'COMPLETED' },
  });
  const tenantId = defaultTenant.id;
  console.log(`✅ Default tenant (id: ${tenantId})`);

  // ─── SUBSCRIPTION for default tenant ───
  const existingSub = await prisma.subscription.findFirst({ where: { tenantId } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        tenantId,
        planId: enterprisePlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Subscription (Enterprise)');

  // ─── TENANT USAGE ───
  await prisma.tenantUsage.upsert({
    where: { tenantId },
    update: {},
    create: { tenantId, lastCalculated: new Date() },
  });
  console.log('✅ Tenant usage');

  // ─── SUPER ADMIN (global, no tenantId) ───
  const superAdminPw = await bcrypt.hash('SuperAdmin@123', 12);
  await prisma.superAdmin.upsert({
    where: { email: 'platform@crm.com' },
    update: {},
    create: { email: 'platform@crm.com', password: superAdminPw, firstName: 'Platform', lastName: 'Admin' },
  });
  console.log('✅ SuperAdmin (platform@crm.com)');

  // ─── ROLES ───
  const roles = await Promise.all([
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'SUPER_ADMIN' } }, update: {}, create: { tenantId, name: 'SUPER_ADMIN', displayName: 'Super Admin', description: 'Full access', isSystem: true } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'ADMIN' } }, update: {}, create: { tenantId, name: 'ADMIN', displayName: 'Admin', description: 'Tenant admin', isSystem: true } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'MANAGER' } }, update: {}, create: { tenantId, name: 'MANAGER', displayName: 'Manager', description: 'Team manager' } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'SALES_EXECUTIVE' } }, update: {}, create: { tenantId, name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', description: 'Field sales' } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'MARKETING_STAFF' } }, update: {}, create: { tenantId, name: 'MARKETING_STAFF', displayName: 'Marketing Staff', description: 'Marketing team' } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'SUPPORT_AGENT' } }, update: {}, create: { tenantId, name: 'SUPPORT_AGENT', displayName: 'Support Agent', description: 'Customer support' } }),
    prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'ACCOUNT_MANAGER' } }, update: {}, create: { tenantId, name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: 'Post-sales' } }),
  ]);
  console.log(`✅ ${roles.length} roles`);

  // ─── PERMISSIONS (global, no tenantId) ───
  const modules = ['contacts','raw_contacts','organizations','leads','activities','demos','tour-plans','quotations','invoices','payments','installations','trainings','licenses','ledgers','support-tickets','communications','users','roles','lookups','ownership','reports','departments','designations','brands','manufacturers','packages','locations','menus','custom_fields','products','product_pricing','workflows','follow-ups','reminders','recurrence','calendar','dashboard','analytics','performance','audit','settings','wallet','notifications'];
  const actions = ['create','read','update','delete','export'];
  let pc = 0;
  for (const m of modules) {
    for (const a of actions) {
      await prisma.permission.upsert({ where: { module_action: { module: m, action: a } }, update: {}, create: { module: m, action: a, description: `${a} ${m}` } });
      pc++;
    }
  }
  console.log(`✅ ${pc} permissions`);

  // ─── USERS ───
  const pw = await bcrypt.hash('Admin@123', 12);
  const sa = roles.find(r => r.name === 'SUPER_ADMIN')!;
  const admin = await prisma.user.upsert({ where: { tenantId_email: { tenantId, email: 'admin@crm.com' } }, update: {}, create: { tenantId, email: 'admin@crm.com', password: pw, firstName: 'System', lastName: 'Admin', roleId: sa.id } });
  const mgr = roles.find(r => r.name === 'MANAGER')!;
  const se = roles.find(r => r.name === 'SALES_EXECUTIVE')!;
  const mk = roles.find(r => r.name === 'MARKETING_STAFF')!;
  await prisma.user.upsert({ where: { tenantId_email: { tenantId, email: 'manager@crm.com' } }, update: {}, create: { tenantId, email: 'manager@crm.com', password: pw, firstName: 'Sales', lastName: 'Manager', roleId: mgr.id, createdBy: admin.id } });
  await prisma.user.upsert({ where: { tenantId_email: { tenantId, email: 'sales1@crm.com' } }, update: {}, create: { tenantId, email: 'sales1@crm.com', password: pw, firstName: 'Raj', lastName: 'Patel', roleId: se.id, createdBy: admin.id } });
  await prisma.user.upsert({ where: { tenantId_email: { tenantId, email: 'marketing1@crm.com' } }, update: {}, create: { tenantId, email: 'marketing1@crm.com', password: pw, firstName: 'Priya', lastName: 'Shah', roleId: mk.id, createdBy: admin.id } });
  console.log('✅ 4 users (all password: Admin@123)');

  // NEW: Customer Role
  const custRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId, name: 'CUSTOMER' } }, update: {},
    create: { tenantId, name: 'CUSTOMER', displayName: 'Customer', description: 'Customer portal access' },
  });

  // NEW: Referral Partner Role
  const partnerRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId, name: 'REFERRAL_PARTNER' } }, update: {},
    create: { tenantId, name: 'REFERRAL_PARTNER', displayName: 'Referral Partner', description: 'Partner portal access' },
  });

  // NEW: Sample Customer
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: 'customer@example.com' } }, update: {},
    create: {
      tenantId, email: 'customer@example.com', password: pw,
      firstName: 'Vikram', lastName: 'Customer',
      roleId: custRole.id, userType: 'CUSTOMER',
      createdBy: admin.id,
    },
  });
  // Create customer profile
  const custUser = await prisma.user.findFirst({ where: { tenantId, email: 'customer@example.com' } });
  if (custUser) {
    await prisma.customerProfile.upsert({
      where: { userId: custUser.id }, update: {},
      create: {
        tenantId, userId: custUser.id, companyName: 'TechCorp India',
        gstNumber: '27AABCT1234Q1Z5', city: 'Mumbai',
        state: 'Maharashtra', country: 'India', industry: 'IT',
      },
    });
  }

  // NEW: Sample Referral Partner
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: 'partner@example.com' } }, update: {},
    create: {
      tenantId, email: 'partner@example.com', password: pw,
      firstName: 'Suresh', lastName: 'Partner',
      roleId: partnerRole.id, userType: 'REFERRAL_PARTNER',
      createdBy: admin.id,
    },
  });
  const partnerUser = await prisma.user.findFirst({ where: { tenantId, email: 'partner@example.com' } });
  if (partnerUser) {
    await prisma.referralPartner.upsert({
      where: { userId: partnerUser.id }, update: {},
      create: {
        tenantId, userId: partnerUser.id, referralCode: 'SUR-ABC123',
        commissionRate: 10, panNumber: 'ABCPD1234E',
      },
    });
  }

  // UPDATE existing users with userType
  const adminUser = await prisma.user.findFirst({ where: { tenantId, email: 'admin@crm.com' } });
  if (adminUser) await prisma.user.update({ where: { id: adminUser.id }, data: { userType: 'ADMIN' } });

  const managerUser = await prisma.user.findFirst({ where: { tenantId, email: 'manager@crm.com' } });
  if (managerUser) await prisma.user.update({ where: { id: managerUser.id }, data: { userType: 'EMPLOYEE' } });

  const sales1User = await prisma.user.findFirst({ where: { tenantId, email: 'sales1@crm.com' } });
  if (sales1User) await prisma.user.update({ where: { id: sales1User.id }, data: { userType: 'EMPLOYEE' } });

  const marketing1User = await prisma.user.findFirst({ where: { tenantId, email: 'marketing1@crm.com' } });
  if (marketing1User) await prisma.user.update({ where: { id: marketing1User.id }, data: { userType: 'EMPLOYEE' } });

  console.log('✅ 6 users (Admin, Employee, Customer, Partner)');

  // ─── LOOKUP SEED DATA (from shared file) ───

  for (const lk of LOOKUP_SEED_DATA) {
    const lookup = await prisma.masterLookup.upsert({
      where: { tenantId_category: { tenantId, category: lk.category } },
      create: { tenantId, category: lk.category, displayName: lk.displayName, isSystem: lk.isSystem ?? false },
      update: { displayName: lk.displayName },
    });

    for (let i = 0; i < lk.values.length; i++) {
      const v = lk.values[i];
      await prisma.lookupValue.upsert({
        where: { tenantId_lookupId_value: { tenantId, lookupId: lookup.id, value: v.value } },
        create: {
          tenantId, lookupId: lookup.id, value: v.value, label: v.label,
          icon: v.icon || null, color: v.color || null, rowIndex: i,
        },
        update: { label: v.label, icon: v.icon || null, color: v.color || null, rowIndex: i },
      });
    }
  }
  console.log(`✅ ${LOOKUP_SEED_DATA.length} lookup categories seeded`);

  // Assign all permissions to SUPER_ADMIN and ADMIN roles
  const allPerms = await prisma.permission.findMany();
  const adminRole = roles.find(r => r.name === 'ADMIN')!;
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: sa.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: sa.id, permissionId: p.id },
    });
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: adminRole.id, permissionId: p.id },
    });
  }
  console.log(`✅ ${allPerms.length} permissions → SUPER_ADMIN + ADMIN`);

  // Assign read-focused permissions to MANAGER, SALES_EXECUTIVE, etc.
  const mgrRole = roles.find(r => r.name === 'MANAGER')!;
  const seRole = roles.find(r => r.name === 'SALES_EXECUTIVE')!;
  const mkRole = roles.find(r => r.name === 'MARKETING_STAFF')!;
  const supRole = roles.find(r => r.name === 'SUPPORT_AGENT')!;
  const amRole = roles.find(r => r.name === 'ACCOUNT_MANAGER')!;

  const MANAGER_MODULES = ['contacts','raw_contacts','organizations','leads','activities','demos',
    'tour-plans','quotations','invoices','payments','installations','trainings','support-tickets',
    'communications','reports','dashboard','analytics','performance','follow-ups','reminders',
    'recurrence','calendar','products','product_pricing','custom_fields','wallet','notifications'];
  const SALES_MODULES = ['contacts','raw_contacts','organizations','leads','activities','demos',
    'tour-plans','quotations','follow-ups','reminders','recurrence','calendar','dashboard',
    'communications','products','product_pricing','notifications'];
  const SUPPORT_MODULES = ['contacts','organizations','support-tickets','communications',
    'installations','trainings','dashboard','calendar','notifications'];

  type PermRow = { id: string; module: string; action: string };
  const mgrPerms = (allPerms as PermRow[]).filter(p => MANAGER_MODULES.includes(p.module));
  const salesPerms = (allPerms as PermRow[]).filter(p => SALES_MODULES.includes(p.module));
  const supportPerms = (allPerms as PermRow[]).filter(p => SUPPORT_MODULES.includes(p.module));

  for (const p of mgrPerms) {
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: mgrRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: mgrRole.id, permissionId: p.id },
    });
  }
  for (const p of salesPerms) {
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: seRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: seRole.id, permissionId: p.id },
    });
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: mkRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: mkRole.id, permissionId: p.id },
    });
  }
  for (const p of supportPerms) {
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: supRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: supRole.id, permissionId: p.id },
    });
    await prisma.rolePermission.upsert({
      where: { tenantId_roleId_permissionId: { tenantId, roleId: amRole.id, permissionId: p.id } },
      update: {},
      create: { tenantId, roleId: amRole.id, permissionId: p.id },
    });
  }
  console.log('✅ Permissions assigned to MANAGER, SALES, MARKETING, SUPPORT, ACCOUNT_MANAGER');

  // ─── MENUS ───
  const menuCount = await seedMenus(tenantId);
  console.log(`✅ ${menuCount} menu items seeded`);

  // ─── NEW ROLES (TEAM_LEAD, TELECALLER, VIEWER) ───
  await prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'TEAM_LEAD' } }, update: {}, create: { tenantId, name: 'TEAM_LEAD', displayName: 'Team Lead', description: 'Team lead / supervisor' } });
  await prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'TELECALLER' } }, update: {}, create: { tenantId, name: 'TELECALLER', displayName: 'Telecaller', description: 'Outbound calls' } });
  await prisma.role.upsert({ where: { tenantId_name: { tenantId, name: 'VIEWER' } }, update: {}, create: { tenantId, name: 'VIEWER', displayName: 'Viewer', description: 'Read-only access' } });
  console.log('✅ Additional roles created');

  // ─── ROLE LEVELS ───
  const roleLevels: { name: string; level: number; canManageLevels: number[] }[] = [
    { name: 'SUPER_ADMIN', level: 0, canManageLevels: [1, 2, 3, 4, 5, 6] },
    { name: 'ADMIN', level: 1, canManageLevels: [2, 3, 4, 5, 6] },
    { name: 'MANAGER', level: 2, canManageLevels: [3, 4, 5] },
    { name: 'TEAM_LEAD', level: 3, canManageLevels: [4, 5] },
    { name: 'SALES_EXECUTIVE', level: 4, canManageLevels: [] },
    { name: 'MARKETING_STAFF', level: 4, canManageLevels: [] },
    { name: 'SUPPORT_AGENT', level: 4, canManageLevels: [] },
    { name: 'ACCOUNT_MANAGER', level: 4, canManageLevels: [] },
    { name: 'TELECALLER', level: 5, canManageLevels: [] },
    { name: 'CUSTOMER', level: 5, canManageLevels: [] },
    { name: 'REFERRAL_PARTNER', level: 5, canManageLevels: [] },
    { name: 'VIEWER', level: 6, canManageLevels: [] },
  ];
  for (const rl of roleLevels) {
    await prisma.role.updateMany({
      where: { tenantId, name: rl.name },
      data: { level: rl.level, canManageLevels: rl.canManageLevels },
    });
  }
  console.log('✅ Role levels updated');

  // ─── DEPARTMENTS ───
  const departments: { name: string; displayName: string; code: string; path: string; level: number; parentName?: string }[] = [
    { name: 'COMPANY', displayName: 'Company HQ', code: 'COMPANY', path: '/COMPANY', level: 0 },
    { name: 'SALES', displayName: 'Sales', code: 'SALES', path: '/COMPANY/SALES', level: 1 },
    { name: 'SALES_NORTH', displayName: 'Sales North', code: 'SALES_NORTH', path: '/COMPANY/SALES/NORTH', level: 2 },
    { name: 'SALES_SOUTH', displayName: 'Sales South', code: 'SALES_SOUTH', path: '/COMPANY/SALES/SOUTH', level: 2 },
    { name: 'MARKETING', displayName: 'Marketing', code: 'MARKETING', path: '/COMPANY/MARKETING', level: 1 },
    { name: 'SUPPORT', displayName: 'Support', code: 'SUPPORT', path: '/COMPANY/SUPPORT', level: 1 },
  ];
  const deptMap: Record<string, string> = {};
  for (const d of departments) {
    const dept = await prisma.department.upsert({
      where: { tenantId_name: { tenantId, name: d.name } },
      create: {
        tenantId, name: d.name, displayName: d.displayName, code: d.code,
        path: d.path, level: d.level,
        parentId: d.parentName ? deptMap[d.parentName] : null,
      },
      update: { path: d.path, displayName: d.displayName, code: d.code, level: d.level },
    });
    deptMap[d.name] = dept.id;
  }
  // Fix parent references
  const salesDept = await prisma.department.findFirst({ where: { tenantId, name: 'SALES' } });
  if (salesDept) await prisma.department.update({ where: { id: salesDept.id }, data: { parentId: deptMap['COMPANY'] } });

  const salesNorthDept = await prisma.department.findFirst({ where: { tenantId, name: 'SALES_NORTH' } });
  if (salesNorthDept) await prisma.department.update({ where: { id: salesNorthDept.id }, data: { parentId: deptMap['SALES'] } });

  const salesSouthDept = await prisma.department.findFirst({ where: { tenantId, name: 'SALES_SOUTH' } });
  if (salesSouthDept) await prisma.department.update({ where: { id: salesSouthDept.id }, data: { parentId: deptMap['SALES'] } });

  const marketingDept = await prisma.department.findFirst({ where: { tenantId, name: 'MARKETING' } });
  if (marketingDept) await prisma.department.update({ where: { id: marketingDept.id }, data: { parentId: deptMap['COMPANY'] } });

  const supportDept = await prisma.department.findFirst({ where: { tenantId, name: 'SUPPORT' } });
  if (supportDept) await prisma.department.update({ where: { id: supportDept.id }, data: { parentId: deptMap['COMPANY'] } });

  console.log('✅ Departments seeded');

  // ─── APPROVAL RULES ───
  const approvalRules: { entityType: string; action: string; checkerRole: string; skipForRoles: string[]; amountField?: string; amountThreshold?: number }[] = [
    { entityType: 'lead', action: 'leads:status_change_WON', checkerRole: 'MANAGER', skipForRoles: ['ADMIN', 'SUPER_ADMIN'] },
    { entityType: 'lead', action: 'leads:status_change_LOST', checkerRole: 'TEAM_LEAD', skipForRoles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { entityType: 'quotation', action: 'quotations:approve', checkerRole: 'MANAGER', skipForRoles: ['ADMIN'], amountField: 'amount', amountThreshold: 50000 },
    { entityType: 'contact', action: 'contacts:bulk_delete', checkerRole: 'ADMIN', skipForRoles: ['SUPER_ADMIN'] },
    { entityType: 'employee', action: 'users:role_change', checkerRole: 'ADMIN', skipForRoles: ['SUPER_ADMIN'] },
  ];
  for (const ar of approvalRules) {
    await prisma.approvalRule.upsert({
      where: { tenantId_entityType_action: { tenantId, entityType: ar.entityType, action: ar.action } },
      create: {
        tenantId, entityType: ar.entityType, action: ar.action,
        checkerRole: ar.checkerRole, skipForRoles: ar.skipForRoles,
        amountField: ar.amountField, amountThreshold: ar.amountThreshold,
      },
      update: { checkerRole: ar.checkerRole, skipForRoles: ar.skipForRoles },
    });
  }
  console.log('✅ Approval rules seeded');

  // ─── AUTO-NUMBER SEQUENCES ───
  const autoNumberSequences = [
    // Settings seeder entities
    { entityName: 'Lead', prefix: 'L', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Contact', prefix: 'C', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Organization', prefix: 'ORG', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Quotation', prefix: 'QTN', formatPattern: '{PREFIX}/{YY}{MM}/{SEQ:4}', resetPolicy: 'MONTHLY' as const },
    { entityName: 'Invoice', prefix: 'INV', formatPattern: '{PREFIX}-{YYYY}-{MM}-{SEQ:4}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Ticket', prefix: 'TKT', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Activity', prefix: 'ACT', formatPattern: '{PREFIX}-{YYYY}{MM}{DD}-{SEQ:4}', resetPolicy: 'DAILY' as const },
    // Payment seeder entities
    { entityName: 'Payment', prefix: 'PAY', formatPattern: 'PAY-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Receipt', prefix: 'RCT', formatPattern: 'RCT-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'Refund', prefix: 'RFD', formatPattern: 'RFD-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
    { entityName: 'CreditNote', prefix: 'CN', formatPattern: 'CN-{YYYY}/{MM}-{SEQ:4}', resetPolicy: 'YEARLY' as const },
    { entityName: 'ProformaInvoice', prefix: 'PI', formatPattern: 'PI-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' as const },
  ];
  for (const seq of autoNumberSequences) {
    await prisma.autoNumberSequence.upsert({
      where: { tenantId_entityName: { tenantId, entityName: seq.entityName } },
      update: {},
      create: {
        tenantId,
        entityName: seq.entityName,
        prefix: seq.prefix,
        formatPattern: seq.formatPattern,
        currentSequence: 0,
        seqPadding: 5,
        startFrom: 1,
        incrementBy: 1,
        resetPolicy: seq.resetPolicy as any,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${autoNumberSequences.length} auto-number sequences seeded`);

  // Product filter lookups are now included in LOOKUP_SEED_DATA above

  // ─── CUSTOMER PRICE GROUPS ───
  const priceGroups = [
    { name: 'Rate A', code: 'RATE_A', description: 'Premium enterprise pricing', discount: 5, priority: 4 },
    { name: 'Rate B', code: 'RATE_B', description: 'Standard business pricing', discount: 10, priority: 3 },
    { name: 'Rate C', code: 'RATE_C', description: 'Volume discount pricing', discount: 15, priority: 2 },
    { name: 'Rate D', code: 'RATE_D', description: 'Wholesale pricing', discount: 20, priority: 1 },
    { name: 'Retail', code: 'RETAIL', description: 'Default retail pricing', discount: 0, priority: 0 },
  ];
  for (const pg of priceGroups) {
    await prisma.customerPriceGroup.upsert({
      where: { tenantId_code: { tenantId, code: pg.code } },
      create: { tenantId, ...pg },
      update: { name: pg.name, discount: pg.discount, priority: pg.priority },
    });
  }
  console.log('✅ 5 customer price groups seeded');

  // ─── SAMPLE PRODUCTS ───
  // Master: CRM Suite
  const crmMaster = await prisma.product.upsert({
    where: { tenantId_code: { tenantId, code: 'PRD-00001' } },
    create: {
      tenantId, name: 'CRM Suite', code: 'PRD-00001', slug: 'crm-suite',
      shortDescription: 'Complete CRM solution', isMaster: true,
      mrp: 49999, salePrice: 44999, purchasePrice: 30000, costPrice: 25000,
      taxType: 'GST', hsnCode: '8523', gstRate: 18, taxInclusive: false,
      primaryUnit: 'PIECE', status: 'ACTIVE',
      tags: ['crm', 'saas', 'enterprise'], createdById: admin.id,
    },
    update: {},
  });
  // CRM children
  const crmChildren = [
    { name: 'CRM Basic', code: 'PRD-00002', slug: 'crm-basic', mrp: 14999, salePrice: 12999 },
    { name: 'CRM Professional', code: 'PRD-00003', slug: 'crm-professional', mrp: 29999, salePrice: 26999 },
    { name: 'CRM Enterprise', code: 'PRD-00004', slug: 'crm-enterprise', mrp: 49999, salePrice: 44999 },
  ];
  for (const ch of crmChildren) {
    await prisma.product.upsert({
      where: { tenantId_code: { tenantId, code: ch.code } },
      create: {
        tenantId, ...ch, shortDescription: `${ch.name} edition`,
        parentId: crmMaster.id, isMaster: false,
        purchasePrice: Math.round(ch.mrp * 0.6), costPrice: Math.round(ch.mrp * 0.5),
        taxType: 'GST', hsnCode: '8523', gstRate: 18, taxInclusive: false,
        primaryUnit: 'PIECE', status: 'ACTIVE',
        tags: ['crm', 'saas'], createdById: admin.id,
      },
      update: {},
    });
  }

  // Master: ERP Suite
  const erpMaster = await prisma.product.upsert({
    where: { tenantId_code: { tenantId, code: 'PRD-00005' } },
    create: {
      tenantId, name: 'ERP Suite', code: 'PRD-00005', slug: 'erp-suite',
      shortDescription: 'Enterprise resource planning', isMaster: true,
      mrp: 99999, salePrice: 89999, purchasePrice: 60000, costPrice: 50000,
      taxType: 'GST', hsnCode: '8523', gstRate: 18, taxInclusive: false,
      primaryUnit: 'PIECE', status: 'ACTIVE',
      tags: ['erp', 'saas', 'enterprise'], createdById: admin.id,
    },
    update: {},
  });
  // ERP children
  const erpChildren = [
    { name: 'ERP Standard', code: 'PRD-00006', slug: 'erp-standard', mrp: 59999, salePrice: 54999 },
    { name: 'ERP Premium', code: 'PRD-00007', slug: 'erp-premium', mrp: 99999, salePrice: 89999 },
  ];
  for (const ch of erpChildren) {
    await prisma.product.upsert({
      where: { tenantId_code: { tenantId, code: ch.code } },
      create: {
        tenantId, ...ch, shortDescription: `${ch.name} edition`,
        parentId: erpMaster.id, isMaster: false,
        purchasePrice: Math.round(ch.mrp * 0.6), costPrice: Math.round(ch.mrp * 0.5),
        taxType: 'GST', hsnCode: '8523', gstRate: 18, taxInclusive: false,
        primaryUnit: 'PIECE', status: 'ACTIVE',
        tags: ['erp', 'saas'], createdById: admin.id,
      },
      update: {},
    });
  }

  // Standalone products
  await prisma.product.upsert({
    where: { tenantId_code: { tenantId, code: 'PRD-00008' } },
    create: {
      tenantId, name: 'Annual Support Plan', code: 'PRD-00008', slug: 'annual-support-plan',
      shortDescription: 'Yearly technical support',
      mrp: 19999, salePrice: 17999, purchasePrice: 10000, costPrice: 8000,
      taxType: 'GST', hsnCode: '9983', gstRate: 18, taxInclusive: false,
      primaryUnit: 'PIECE', status: 'ACTIVE',
      tags: ['support', 'service'], createdById: admin.id,
    },
    update: {},
  });
  await prisma.product.upsert({
    where: { tenantId_code: { tenantId, code: 'PRD-00009' } },
    create: {
      tenantId, name: 'Implementation Service', code: 'PRD-00009', slug: 'implementation-service',
      shortDescription: 'On-site implementation and training',
      mrp: 75000, salePrice: 65000, purchasePrice: 40000, costPrice: 35000,
      taxType: 'GST', hsnCode: '9983', gstRate: 18, taxInclusive: false,
      primaryUnit: 'PIECE', status: 'ACTIVE',
      tags: ['service', 'implementation'], createdById: admin.id,
    },
    update: {},
  });
  console.log('✅ 9 sample products seeded (2 masters + 5 children + 2 standalone)');

  // ─── WORKFLOW SEEDS ───
  console.log('\n📊 Seeding workflows...');
  await seedLeadWorkflow(prisma, admin.id, tenantId);
  await seedDemoWorkflow(prisma, admin.id, tenantId);
  await seedTourPlanWorkflow(prisma, admin.id, tenantId);
  await seedQuotationWorkflow(prisma, admin.id, tenantId);
  console.log('✅ 4 default workflows seeded');

  // ─── REPORT DEFINITIONS ───
  console.log('\n📊 Seeding report definitions...');
  await seedReportDefinitions(prisma, tenantId);

  // ─── SYNC POLICIES & WARNING RULES ───
  console.log('\n📡 Seeding sync policies...');
  await seedSyncPolicies(prisma, tenantId);

  // ─── TENANT CONFIGS ───
  console.log('\n⚙️ Seeding tenant configs...');
  await seedTenantConfigs(prisma, tenantId);

  // ─── TASK ENGINE (configs, templates, cron jobs) ───
  console.log('\n⚙️ Seeding task engine...');
  await seedTaskEngine(prisma);

  // ─── PERMISSION TEMPLATES ───
  console.log('\n🔐 Seeding permission templates...');
  const templateCount = await seedPermissionTemplates(prisma);
  console.log(`✅ ${templateCount} permission templates seeded`);

  // ─── RAW CONTACTS (1000 dummy records) ───
  await seedRawContacts(prisma, admin.id, tenantId, 1000);

  // ─── DEMO DATA (3 tenants + 35 users) ───
  console.log('\n🏢 Seeding demo data...');
  await seedDemoData(prisma);

  // ─── MODULE & PACKAGE MANAGEMENT ───
  console.log('\n📦 Seeding modules & packages...');
  await seedModulesAndPackages(prisma);

  // ─── BUSINESS TYPES (15 industries) ───
  console.log('\n🏭 Seeding business types...');
  for (let i = 0; i < BUSINESS_TYPE_SEED_DATA.length; i++) {
    const bt = BUSINESS_TYPE_SEED_DATA[i];
    await prisma.businessTypeRegistry.upsert({
      where: { typeCode: bt.typeCode },
      update: {
        typeName: bt.typeName,
        industryCategory: bt.industryCategory as any,
        description: bt.description,
        icon: bt.icon,
        colorTheme: bt.colorTheme,
        terminologyMap: bt.terminologyMap,
        defaultModules: bt.defaultModules,
        recommendedModules: bt.recommendedModules,
        excludedModules: bt.excludedModules,
        dashboardWidgets: bt.dashboardWidgets,
        workflowTemplates: bt.workflowTemplates,
        extraFields: bt.extraFields ?? {},
        defaultLeadStages: bt.defaultLeadStages ?? undefined,
        defaultActivityTypes: bt.defaultActivityTypes ?? undefined,
        registrationFields: bt.registrationFields ?? undefined,
        isDefault: bt.isDefault ?? false,
      },
      create: {
        typeCode: bt.typeCode,
        typeName: bt.typeName,
        industryCategory: bt.industryCategory as any,
        description: bt.description,
        icon: bt.icon,
        colorTheme: bt.colorTheme,
        terminologyMap: bt.terminologyMap,
        defaultModules: bt.defaultModules,
        recommendedModules: bt.recommendedModules,
        excludedModules: bt.excludedModules,
        dashboardWidgets: bt.dashboardWidgets,
        workflowTemplates: bt.workflowTemplates,
        extraFields: bt.extraFields ?? {},
        defaultLeadStages: bt.defaultLeadStages ?? undefined,
        defaultActivityTypes: bt.defaultActivityTypes ?? undefined,
        registrationFields: bt.registrationFields ?? undefined,
        isDefault: bt.isDefault ?? false,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ ${BUSINESS_TYPE_SEED_DATA.length} business types seeded`);

  // ─── STEP: Seed Document Templates ───
  const { seedDocumentTemplates } = await import('./seeds/document-template.seed');
  await seedDocumentTemplates(prisma);

  // ─── STEP: Seed Formulas ───
  const { seedFormulas } = await import('./seeds/formula.seed');
  await seedFormulas(prisma);

  // ─── STEP: Safe Complete Seed (menus, pages, error rules, sample data) ───
  const { safeCompleteSeed } = await import('./seeds/safe-complete-seed');
  await safeCompleteSeed(prisma);

  console.log('\n🔑 Platform: platform@crm.com / SuperAdmin@123');
  console.log('🔑 Admin:    admin@crm.com / Admin@123');
  console.log('🔑 Employee: manager@crm.com / Admin@123');
  console.log('🔑 Employee: sales1@crm.com / Admin@123');
  console.log('🔑 Employee: marketing1@crm.com / Admin@123');
  console.log('🔑 Customer: customer@example.com / Admin@123');
  console.log('🔑 Partner:  partner@example.com / Admin@123');
  // ─── INVENTORY SYSTEM ───
  console.log('\n📦 Seeding inventory system...');
  await seedInventory(prisma);

  // ─── ACCOUNT MASTER V2 ───
  console.log('\n📒 Seeding Account Master V2 (Groups, Sale/Purchase Masters)...');
  const { seedAccountMaster } = await import('./seeds/account-master.seed');
  await seedAccountMaster(prisma, tenantId);

  // ─── KEYBOARD SHORTCUTS ───
  console.log('\n⌨️  Seeding keyboard shortcut definitions...');
  await seedShortcutDefinitions(prisma);

  // ─── AMC & WARRANTY ───
  console.log('\n🛡️  Seeding AMC & Warranty templates...');
  await seedAmcWarranty(prisma);

  // ─── SELF-HOSTED AI (models catalog + system prompts) ───
  console.log('\n🤖 Seeding Self-Hosted AI...');
  const { seedSelfHostedAi } = await import('./seeds/self-hosted-ai.seed');
  await seedSelfHostedAi(prisma);

  // ─── CALENDAR HIGHLIGHTS (national holidays for DatePicker) ───
  console.log('\n📅 Seeding calendar highlights...');
  await seedCalendarHighlights(prisma);

  console.log('\n🏢 Demo Tenant Accounts (password: Test@123):');
  console.log('🔑 Sharma:   rajesh@sharmaenterprises.com');
  console.log('🔑 Mumbai:   arun@mumbaidistributors.com');
  console.log('🔑 TechServe: sanjay@techserve.in\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
