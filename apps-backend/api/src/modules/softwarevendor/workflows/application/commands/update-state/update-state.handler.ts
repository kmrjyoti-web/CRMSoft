import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateStateCommand } from './update-state.command';

@CommandHandler(UpdateStateCommand)
export class UpdateStateHandler implements ICommandHandler<UpdateStateCommand> {
    private readonly logger = new Logger(UpdateStateHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateStateCommand) {
    try {
      const state = await this.prisma.workflowState.findUnique({ where: { id: cmd.stateId } });
      if (!state) throw new NotFoundException(`State "${cmd.stateId}" not found`);
      return this.prisma.workflowState.update({ where: { id: cmd.stateId }, data: cmd.data as any });
    } catch (error) {
      this.logger.error(`UpdateStateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
