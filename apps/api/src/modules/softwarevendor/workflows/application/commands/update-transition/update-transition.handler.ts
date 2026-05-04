import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateTransitionCommand } from './update-transition.command';

@CommandHandler(UpdateTransitionCommand)
export class UpdateTransitionHandler implements ICommandHandler<UpdateTransitionCommand> {
    private readonly logger = new Logger(UpdateTransitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTransitionCommand) {
    try {
      const t = await this.prisma.workflowTransition.findUnique({ where: { id: cmd.transitionId } });
      if (!t) throw new NotFoundException(`Transition "${cmd.transitionId}" not found`);
      return this.prisma.workflowTransition.update({ where: { id: cmd.transitionId }, data: cmd.data as any });
    } catch (error) {
      this.logger.error(`UpdateTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
