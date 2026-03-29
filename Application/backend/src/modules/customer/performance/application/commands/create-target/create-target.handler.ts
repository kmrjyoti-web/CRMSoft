// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTargetCommand } from './create-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateTargetCommand)
export class CreateTargetHandler implements ICommandHandler<CreateTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateTargetCommand) {
    return this.prisma.working.salesTarget.create({
      data: {
        name: cmd.name,
        metric: cmd.metric as any,
        targetValue: cmd.targetValue,
        period: cmd.period as any,
        periodStart: new Date(cmd.periodStart),
        periodEnd: new Date(cmd.periodEnd),
        userId: cmd.userId,
        roleId: cmd.roleId,
        notes: cmd.notes,
        createdById: cmd.createdById,
      },
    });
  }
}
