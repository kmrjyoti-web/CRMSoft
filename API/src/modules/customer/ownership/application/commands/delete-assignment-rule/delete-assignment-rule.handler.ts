import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteAssignmentRuleCommand } from './delete-assignment-rule.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteAssignmentRuleCommand)
export class DeleteAssignmentRuleHandler implements ICommandHandler<DeleteAssignmentRuleCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteAssignmentRuleCommand) {
    const rule = await this.prisma.assignmentRule.findUnique({ where: { id: command.id } });
    if (!rule) throw new NotFoundException('Assignment rule not found');

    await this.prisma.assignmentRule.update({
      where: { id: command.id },
      data: { isActive: false, status: 'INACTIVE' },
    });

    return { success: true };
  }
}
