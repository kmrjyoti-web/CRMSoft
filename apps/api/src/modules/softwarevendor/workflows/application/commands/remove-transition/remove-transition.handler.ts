import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveTransitionCommand } from './remove-transition.command';

@CommandHandler(RemoveTransitionCommand)
export class RemoveTransitionHandler implements ICommandHandler<RemoveTransitionCommand> {
    private readonly logger = new Logger(RemoveTransitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemoveTransitionCommand) {
    try {
      const t = await this.prisma.workflowTransition.findUnique({ where: { id: cmd.transitionId } });
      if (!t) throw new NotFoundException(`Transition "${cmd.transitionId}" not found`);
      await this.prisma.workflowTransition.delete({ where: { id: cmd.transitionId } });
      return { deleted: true };
    } catch (error) {
      this.logger.error(`RemoveTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
