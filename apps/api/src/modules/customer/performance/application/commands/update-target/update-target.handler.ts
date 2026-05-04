// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTargetCommand } from './update-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTargetCommand)
export class UpdateTargetHandler implements ICommandHandler<UpdateTargetCommand> {
    private readonly logger = new Logger(UpdateTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTargetCommand) {
    try {
      const updateData: any = { ...cmd.data };
      if (cmd.data.metric) updateData.metric = cmd.data.metric as any;
      if (cmd.data.period) updateData.period = cmd.data.period as any;
      if (cmd.data.periodStart) updateData.periodStart = new Date(cmd.data.periodStart);
      if (cmd.data.periodEnd) updateData.periodEnd = new Date(cmd.data.periodEnd);

      return this.prisma.working.salesTarget.update({
        where: { id: cmd.id },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`UpdateTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
