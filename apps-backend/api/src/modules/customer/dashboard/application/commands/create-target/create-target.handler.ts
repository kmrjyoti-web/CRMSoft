import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTargetCommand } from './create-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateTargetCommand)
export class CreateTargetHandler implements ICommandHandler<CreateTargetCommand> {
    private readonly logger = new Logger(CreateTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateTargetCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`CreateTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
