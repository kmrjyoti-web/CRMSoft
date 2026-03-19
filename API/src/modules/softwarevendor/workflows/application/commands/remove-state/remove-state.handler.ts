import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveStateCommand } from './remove-state.command';

@CommandHandler(RemoveStateCommand)
export class RemoveStateHandler implements ICommandHandler<RemoveStateCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemoveStateCommand) {
    const state = await this.prisma.workflowState.findUnique({ where: { id: cmd.stateId } });
    if (!state) throw new NotFoundException(`State "${cmd.stateId}" not found`);

    const usedInTransitions = await this.prisma.workflowTransition.count({
      where: { OR: [{ fromStateId: cmd.stateId }, { toStateId: cmd.stateId }] },
    });
    if (usedInTransitions > 0) throw new BadRequestException('Cannot delete state used in transitions');

    const usedInInstances = await this.prisma.workflowInstance.count({ where: { currentStateId: cmd.stateId } });
    if (usedInInstances > 0) throw new BadRequestException('Cannot delete state used by active instances');

    await this.prisma.workflowState.delete({ where: { id: cmd.stateId } });
    return { deleted: true };
  }
}
