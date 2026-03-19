import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAssignmentRuleCommand } from './create-assignment-rule.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateAssignmentRuleCommand)
export class CreateAssignmentRuleHandler implements ICommandHandler<CreateAssignmentRuleCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateAssignmentRuleCommand) {
    return this.prisma.working.assignmentRule.create({
      data: {
        name: command.name, description: command.description,
        entityType: command.entityType as any, triggerEvent: command.triggerEvent,
        conditions: command.conditions, assignmentMethod: command.assignmentMethod as any,
        assignToUserId: command.assignToUserId,
        assignToTeamIds: command.assignToTeamIds || [],
        assignToRoleId: command.assignToRoleId,
        ownerType: (command.ownerType as any) || 'PRIMARY_OWNER',
        priority: command.priority || 100,
        maxPerUser: command.maxPerUser, respectWorkload: command.respectWorkload || false,
        escalateAfterHours: command.escalateAfterHours,
        escalateToUserId: command.escalateToUserId,
        escalateToRoleId: command.escalateToRoleId,
        createdById: command.createdById,
      },
    });
  }
}
