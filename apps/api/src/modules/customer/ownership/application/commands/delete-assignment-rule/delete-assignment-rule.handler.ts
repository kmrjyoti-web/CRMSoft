import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteAssignmentRuleCommand } from './delete-assignment-rule.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteAssignmentRuleCommand)
export class DeleteAssignmentRuleHandler implements ICommandHandler<DeleteAssignmentRuleCommand> {
    private readonly logger = new Logger(DeleteAssignmentRuleHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteAssignmentRuleCommand) {
    try {
      const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: command.id } });
      if (!rule) throw new NotFoundException('Assignment rule not found');

      await this.prisma.working.assignmentRule.update({
        where: { id: command.id },
        data: { isActive: false, status: 'INACTIVE' },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`DeleteAssignmentRuleHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
