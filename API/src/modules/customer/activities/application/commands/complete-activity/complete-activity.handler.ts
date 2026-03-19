import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CompleteActivityCommand } from './complete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteActivityCommand)
export class CompleteActivityHandler implements ICommandHandler<CompleteActivityCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CompleteActivityCommand) {
    const existing = await this.prisma.activity.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Activity not found');

    return this.prisma.activity.update({
      where: { id: cmd.id },
      data: {
        outcome: cmd.outcome,
        completedAt: new Date(),
      },
      include: { lead: true, contact: true, createdByUser: true },
    });
  }
}
