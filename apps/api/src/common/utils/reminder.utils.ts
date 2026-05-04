import { PrismaService } from '../../core/prisma/prisma.service';

interface CreateReminderParams {
  entityType: string;
  entityId: string;
  eventDate: Date;
  title: string;
  recipientId: string;
  createdById: string;
  channels?: string[];
  minutesBefore?: number;
}

/**
 * Creates auto-reminder records for scheduled events.
 * Called by Activity, Demo, TourPlan, and FollowUp create/update handlers.
 */
export async function createAutoReminder(
  prisma: PrismaService,
  params: CreateReminderParams,
): Promise<void> {
  const {
    entityType,
    entityId,
    eventDate,
    title,
    recipientId,
    createdById,
    channels = ['IN_APP'],
    minutesBefore = 30,
  } = params;

  const scheduledAt = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);

  if (scheduledAt <= new Date()) return;

  for (const channel of channels) {
    await prisma.reminder.create({
      data: {
        entityType,
        entityId,
        channel: channel as any,
        scheduledAt,
        title: `Reminder: ${title}`,
        message: `${title} is scheduled at ${eventDate.toISOString()}`,
        recipientId,
        createdById,
      },
    });
  }
}
