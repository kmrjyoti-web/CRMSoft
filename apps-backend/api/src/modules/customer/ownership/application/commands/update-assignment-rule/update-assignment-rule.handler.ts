import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateAssignmentRuleCommand } from './update-assignment-rule.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateAssignmentRuleCommand)
export class UpdateAssignmentRuleHandler implements ICommandHandler<UpdateAssignmentRuleCommand> {
    private readonly logger = new Logger(UpdateAssignmentRuleHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateAssignmentRuleCommand) {
    try {
      const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: command.id } });
      if (!rule) throw new NotFoundException('Assignment rule not found');

      const updateData: any = {};
      const d = command.data;
      if (d.name !== undefined) updateData.name = d.name;
      if (d.description !== undefined) updateData.description = d.description;
      if (d.conditions !== undefined) updateData.conditions = d.conditions;
      if (d.assignmentMethod !== undefined) updateData.assignmentMethod = d.assignmentMethod;
      if (d.assignToUserId !== undefined) updateData.assignToUserId = d.assignToUserId;
      if (d.assignToTeamIds !== undefined) updateData.assignToTeamIds = d.assignToTeamIds;
      if (d.assignToRoleId !== undefined) updateData.assignToRoleId = d.assignToRoleId;
      if (d.ownerType !== undefined) updateData.ownerType = d.ownerType;
      if (d.priority !== undefined) updateData.priority = d.priority;
      if (d.status !== undefined) updateData.status = d.status;
      if (d.maxPerUser !== undefined) updateData.maxPerUser = d.maxPerUser;
      if (d.respectWorkload !== undefined) updateData.respectWorkload = d.respectWorkload;
      if (d.escalateAfterHours !== undefined) updateData.escalateAfterHours = d.escalateAfterHours;
      if (d.escalateToUserId !== undefined) updateData.escalateToUserId = d.escalateToUserId;
      if (d.escalateToRoleId !== undefined) updateData.escalateToRoleId = d.escalateToRoleId;

      return this.prisma.working.assignmentRule.update({ where: { id: command.id }, data: updateData });
    } catch (error) {
      this.logger.error(`UpdateAssignmentRuleHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
