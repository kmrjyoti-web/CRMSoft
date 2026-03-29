// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTargetCommand } from './update-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTargetCommand)
export class UpdateTargetHandler implements ICommandHandler<UpdateTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTargetCommand) {
    const updateData: any = { ...cmd.data };
    if (cmd.data.metric) updateData.metric = cmd.data.metric as any;
    if (cmd.data.period) updateData.period = cmd.data.period as any;
    if (cmd.data.periodStart) updateData.periodStart = new Date(cmd.data.periodStart);
    if (cmd.data.periodEnd) updateData.periodEnd = new Date(cmd.data.periodEnd);

    return this.prisma.working.salesTarget.update({
      where: { id: cmd.id },
      data: updateData,
    });
  }
}
