import { PrismaClient } from '@prisma/identity-client';
import * as bcrypt from 'bcrypt';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function resetPassword() {
  const email = 'kmrjyoti@gmail.com';
  const newPassword = 'Travvellis@2026';

  console.log('🔍 Finding user:', email);

  const user = await identity.user.findFirst({ where: { email } });

  if (!user) {
    console.log('❌ User not found. Showing all emails in DB:');
    const all = await identity.user.findMany({ select: { email: true, status: true }, take: 20 });
    console.table(all);
    process.exit(1);
  }

  console.log('✅ Found:', user.email, '| id:', user.id, '| status:', user.status);

  const hash = await bcrypt.hash(newPassword, 12);

  await identity.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  console.log('\n✅ Password updated successfully');
  console.log('   Email:   ', email);
  console.log('   Password:', newPassword);
}

resetPassword()
  .catch((e) => { console.error('❌', e.message); process.exit(1); })
  .finally(() => identity.$disconnect());
