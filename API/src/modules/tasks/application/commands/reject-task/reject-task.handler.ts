import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RejectTaskCommand } from './reject-task.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(RejectTaskCommand)
export class RejectTaskHandler implements ICommandHandler<RejectTaskCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RejectTaskCommand) {
    const existing = await this.prisma.task.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Task not found');
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Task is not pending approval');
    }

    const task = await this.prisma.task.update({
      where: { id: cmd.id },
      data: {
        status: 'CANCELLED',
        rejectedReason: cmd.reason,
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Record rejection in history
    await this.prisma.taskHistory.create({
      data: {
        tenantId: existing.tenantId,
        taskId: cmd.id,
        action: 'STATUS_CHANGED',
        field: 'status',
        oldValue: 'PENDING_APPROVAL',
        newValue: 'CANCELLED',
        changedById: cmd.userId,
      },
    });

    return task;
  }
}
