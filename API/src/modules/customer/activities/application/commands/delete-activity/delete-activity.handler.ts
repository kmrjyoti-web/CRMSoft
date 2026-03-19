import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteActivityCommand } from './delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteActivityCommand)
export class DeleteActivityHandler implements ICommandHandler<DeleteActivityCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteActivityCommand) {
    const existing = await this.prisma.activity.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Activity not found');

    await this.prisma.activity.delete({ where: { id: cmd.id } });

    await this.prisma.calendarEvent.updateMany({
      where: { eventType: 'ACTIVITY', sourceId: cmd.id },
      data: { isActive: false },
    });

    return { id: cmd.id, deleted: true };
  }
}
