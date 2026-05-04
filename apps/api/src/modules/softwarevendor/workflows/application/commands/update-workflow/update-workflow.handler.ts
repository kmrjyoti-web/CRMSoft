import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateWorkflowCommand } from './update-workflow.command';

@CommandHandler(UpdateWorkflowCommand)
export class UpdateWorkflowHandler implements ICommandHandler<UpdateWorkflowCommand> {
    private readonly logger = new Logger(UpdateWorkflowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateWorkflowCommand) {
    try {
      const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.id } });
      if (!workflow) throw new NotFoundException(`Workflow "${cmd.id}" not found`);

      return this.prisma.workflow.update({
        where: { id: cmd.id },
        data: cmd.data as any,
      });
    } catch (error) {
      this.logger.error(`UpdateWorkflowHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
