import { PrismaClient } from '@prisma/identity-client';

const p = new PrismaClient();

async function main() {
  const user = await p.user.findFirst({ where: { email: 'kmrjyoti@gmail.com' } });
  if (!user) { console.log('User not found'); return; }

  if ((user as any).talentId) {
    console.log('Already has talentId:', (user as any).talentId);
  } else {
    const latest = await p.user.findFirst({
      where: { talentId: { not: null } } as any,
      orderBy: { talentId: 'desc' } as any,
      select: { talentId: true } as any,
    });
    const num = (latest as any)?.talentId ? parseInt((latest as any).talentId.slice(1), 10) + 1 : 1;
    const talentId = `T${String(num).padStart(7, '0')}`;

    await (p.user as any).update({
      where: { id: user.id },
      data: { talentId },
    });
    console.log('Assigned talentId:', talentId);
  }

  const u = await p.user.findFirst({ where: { email: 'kmrjyoti@gmail.com' }, include: { role: true } });
  console.log('Final state:', { talentId: (u as any)?.talentId, userType: u?.userType, role: u?.role?.name, status: u?.status });
}

main().finally(() => p.$disconnect());
