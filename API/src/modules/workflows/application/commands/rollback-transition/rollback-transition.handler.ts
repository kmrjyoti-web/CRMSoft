import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { RollbackTransitionCommand } from './rollback-transition.command';

@CommandHandler(RollbackTransitionCommand)
export class RollbackTransitionHandler implements ICommandHandler<RollbackTransitionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RollbackTransitionCommand) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: cmd.instanceId },
      include: { currentState: true, previousState: true },
    });
    if (!instance) throw new NotFoundException(`Instance "${cmd.instanceId}" not found`);
    if (!instance.isActive) throw new BadRequestException('Cannot rollback completed instance');
    if (!instance.previousStateId) throw new BadRequestException('No previous state to rollback to');

    const user = await this.prisma.user.findUnique({
      where: { id: cmd.userId }, select: { firstName: true, lastName: true },
    });

    await this.prisma.workflowInstance.update({
      where: { id: cmd.instanceId },
      data: {
        currentStateId: instance.previousStateId,
        previousStateId: instance.currentStateId,
      },
    });

    const history = await this.prisma.workflowHistory.create({
      data: {
        instanceId: cmd.instanceId,
        fromStateId: instance.currentStateId,
        toStateId: instance.previousStateId,
        action: 'ROLLBACK',
        performedById: cmd.userId,
        performedByName: user ? `${user.firstName} ${user.lastName}` : cmd.userId,
        comment: cmd.comment,
      },
    });

    return { instanceId: cmd.instanceId, rolledBackTo: instance.previousState?.code, historyId: history.id };
  }
}
