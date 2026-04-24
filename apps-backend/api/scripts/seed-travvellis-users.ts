/**
 * Seed 3 Travvellis test users into IdentityDB.
 * Run from apps-backend/api: pnpm tsx scripts/seed-travvellis-users.ts
 */
import { PrismaClient } from '@prisma/identity-client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USERS = [
  { email: 'traveler@travvellis.com', password: 'Traveler@123', firstName: 'Traveler', lastName: 'Demo' },
  { email: 'admin@travvellis.com',    password: 'Admin@1234',   firstName: 'Admin',    lastName: 'User' },
  { email: 'demo@travvellis.com',     password: 'Demo@1234',    firstName: 'Demo',     lastName: 'User' },
];

async function main() {
  // Find or create CUSTOMER role (tenantId = "" means platform-level)
  let customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
  if (!customerRole) {
    customerRole = await prisma.role.create({
      data: {
        name: 'CUSTOMER',
        displayName: 'Customer',
        description: 'End-customer portal access',
        level: 10,
      },
    });
    console.log('✅ Created CUSTOMER role:', customerRole.id);
  } else {
    console.log('ℹ️  CUSTOMER role exists:', customerRole.id);
  }

  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12);

    const existing = await prisma.user.findFirst({ where: { email: u.email } });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hash, status: 'ACTIVE', userType: 'CUSTOMER', roleId: customerRole.id },
      });
      console.log(`↺  Updated: ${u.email}`);
    } else {
      await prisma.user.create({
        data: {
          email: u.email,
          password: hash,
          firstName: u.firstName,
          lastName: u.lastName,
          userType: 'CUSTOMER',
          roleId: customerRole.id,
          status: 'ACTIVE',
          emailVerified: true,
          tenantId: '',
        },
      });
      console.log(`✅ Created: ${u.email}`);
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log('Travvellis Test Credentials');
  console.log('──────────────────────────────────────────');
  for (const u of USERS) {
    console.log(`  ${u.email}  /  ${u.password}`);
  }
  console.log('\nLogin URL: http://localhost:3012/login?brand=travvellis');
  console.log('Endpoint:  POST /api/v1/auth/customer/login');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
