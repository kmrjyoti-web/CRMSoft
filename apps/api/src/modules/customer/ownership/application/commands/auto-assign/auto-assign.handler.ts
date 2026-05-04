import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AutoAssignCommand } from './auto-assign.command';
import { RuleEngineService } from '../../../services/rule-engine.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(AutoAssignCommand)
export class AutoAssignHandler implements ICommandHandler<AutoAssignCommand> {
    private readonly logger = new Logger(AutoAssignHandler.name);

  constructor(
    private readonly ruleEngine: RuleEngineService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: AutoAssignCommand) {
    try {
      // Check if entity already has a primary owner
      const existing = await this.prisma.working.entityOwner.findFirst({
        where: { entityType: command.entityType as any, entityId: command.entityId, ownerType: 'PRIMARY_OWNER', isActive: true },
      });
      if (existing) return { assigned: false, reason: 'Entity already has a primary owner' };

      const rule = await this.ruleEngine.evaluate({
        entityType: command.entityType, entityId: command.entityId,
        triggerEvent: command.triggerEvent,
      });

      if (!rule) return { assigned: false, reason: 'No matching rule found' };

      const owner = await this.ruleEngine.executeRule(
        rule, command.entityType, command.entityId,
        command.performedById || 'system',
      );

      return { assigned: true, rule: rule.name, owner };
    } catch (error) {
      this.logger.error(`AutoAssignHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
