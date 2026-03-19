import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveTransitionCommand } from './remove-transition.command';

@CommandHandler(RemoveTransitionCommand)
export class RemoveTransitionHandler implements ICommandHandler<RemoveTransitionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemoveTransitionCommand) {
    const t = await this.prisma.workflowTransition.findUnique({ where: { id: cmd.transitionId } });
    if (!t) throw new NotFoundException(`Transition "${cmd.transitionId}" not found`);
    await this.prisma.workflowTransition.delete({ where: { id: cmd.transitionId } });
    return { deleted: true };
  }
}
