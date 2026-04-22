// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTargetCommand } from './create-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateTargetCommand)
export class CreateTargetHandler implements ICommandHandler<CreateTargetCommand> {
    private readonly logger = new Logger(CreateTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateTargetCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`CreateTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
