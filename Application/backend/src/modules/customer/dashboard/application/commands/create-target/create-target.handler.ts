import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTargetCommand } from './create-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateTargetCommand)
export class CreateTargetHandler implements ICommandHandler<CreateTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateTargetCommand) {
    return this.prisma.working.salesTarget.create({
      data: {
        metric: command.metric as any,
        targetValue: command.targetValue,
        period: command.period as any,
        periodStart: new Date(command.periodStart),
        periodEnd: new Date(command.periodEnd),
        createdById: command.createdById,
        userId: command.userId,
        roleId: command.roleId,
        name: command.name,
        notes: command.notes,
      },
    });
  }
}
