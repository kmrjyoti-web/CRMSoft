// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RescheduleDemoCommand } from './reschedule-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';

@CommandHandler(RescheduleDemoCommand)
export class RescheduleDemoHandler implements ICommandHandler<RescheduleDemoCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RescheduleDemoCommand) {
    const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Demo not found');
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot reschedule a completed or cancelled demo');
    }

    const demo = await this.prisma.working.demo.update({
      where: { id: cmd.id },
      data: {
        scheduledAt: cmd.scheduledAt,
        status: 'RESCHEDULED',
        rescheduleCount: { increment: 1 },
      },
      include: { lead: true, conductedBy: true },
    });

    await createAutoReminder(this.prisma, {
      entityType: 'DEMO',
      entityId: demo.id,
      eventDate: cmd.scheduledAt,
      title: `Rescheduled Demo`,
      recipientId: existing.conductedById,
      createdById: cmd.userId,
    });

    await this.prisma.working.calendarEvent.updateMany({
      where: { eventType: 'DEMO', sourceId: cmd.id },
      data: { startTime: cmd.scheduledAt },
    });

    return demo;
  }
}
