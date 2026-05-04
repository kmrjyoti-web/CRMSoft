// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateActivityCommand } from './update-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../../../core/prisma/cross-db-resolver.service';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';

@CommandHandler(UpdateActivityCommand)
export class UpdateActivityHandler implements ICommandHandler<UpdateActivityCommand> {
    private readonly logger = new Logger(UpdateActivityHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async execute(cmd: UpdateActivityCommand) {
    try {
      const existing = await this.prisma.working.activity.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Activity not found');

      const activity = await this.prisma.working.activity.update({
        where: { id: cmd.id },
        data: cmd.data as any,
        include: { lead: true, contact: true },
      });

      const scheduledAt = cmd.data.scheduledAt || existing.scheduledAt;
      if (scheduledAt) {
        const existingEvent = await this.prisma.working.calendarEvent.findFirst({
          where: { eventType: 'ACTIVITY', sourceId: activity.id },
        });
        if (existingEvent) {
          await this.prisma.working.calendarEvent.update({
            where: { id: existingEvent.id },
            data: {
              title: activity.subject,
              startTime: new Date(scheduledAt),
              endTime: activity.endTime,
            },
          });
        } else {
          await this.prisma.working.calendarEvent.create({
            data: {
              eventType: 'ACTIVITY',
              sourceId: activity.id,
              title: activity.subject,
              description: activity.description,
              startTime: new Date(scheduledAt),
              endTime: activity.endTime,
              color: CALENDAR_COLORS[activity.type] || CALENDAR_COLORS.CALL,
              userId: existing.createdById,
            },
          });
        }
      }

      const createdByUser = await this.resolver.resolveUser(activity.createdById);
      return { ...activity, createdByUser };
    } catch (error) {
      this.logger.error(`UpdateActivityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
