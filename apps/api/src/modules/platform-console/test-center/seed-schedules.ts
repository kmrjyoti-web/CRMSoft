import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

export async function seedDefaultSchedules(db: PlatformConsolePrismaService) {
  // Seed NIGHTLY schedule
  const existingNightly = await db.pcTestSchedule.findFirst({
    where: { scheduleType: 'NIGHTLY' },
  });
  if (!existingNightly) {
    await db.pcTestSchedule.create({
      data: {
        scheduleType: 'NIGHTLY',
        cronExpression: '30 17 * * *',
        isActive: true,
      },
    });
  }

  // Seed WEEKLY schedule
  const existingWeekly = await db.pcTestSchedule.findFirst({
    where: { scheduleType: 'WEEKLY' },
  });
  if (!existingWeekly) {
    await db.pcTestSchedule.create({
      data: {
        scheduleType: 'WEEKLY',
        cronExpression: '30 2 * * 0',
        isActive: true,
      },
    });
  }
}
