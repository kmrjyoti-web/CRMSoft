/**
 * Ensures kmrjyoti@gmail.com has ADMIN role so RBAC permissions work for demo.
 *
 * Background: the person-centric model gives users a global identity role (CUSTOMER/ADMIN/etc.)
 * and a separate company-level role (OWNER/MEMBER). The permission chain currently only evaluates
 * the identity role. Until the permission system is updated to consider company role, demo users
 * who are company OWNERS need ADMIN identity role to access dashboard/analytics/notifications.
 *
 * TODO post-demo: update PermissionChainService to factor in companyRole from JWT.
 */

import { PrismaClient } from '@prisma/identity-client';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function run() {
  const email = process.argv[2] || 'kmrjyoti@gmail.com';

  const adminRole = await identity.role.findFirst({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    console.error('ADMIN role not found in DB');
    process.exit(1);
  }

  const user = await identity.user.findFirst({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await identity.user.update({
    where: { id: user.id },
    data: { roleId: adminRole.id } as any,
  });

  console.log(`✅ Set role=ADMIN for ${email} (userId: ${user.id})`);
}

run()
  .then(() => identity.$disconnect())
  .catch((e) => { console.error(e); identity.$disconnect(); process.exit(1); });
