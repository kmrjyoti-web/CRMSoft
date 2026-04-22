import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignOwnerCommand } from './assign-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(AssignOwnerCommand)
export class AssignOwnerHandler implements ICommandHandler<AssignOwnerCommand> {
    private readonly logger = new Logger(AssignOwnerHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: AssignOwnerCommand) {
    try {
      return this.ownershipCore.assign({
        entityType: command.entityType, entityId: command.entityId,
        userId: command.userId, ownerType: command.ownerType,
        assignedById: command.assignedById, reason: command.reason,
        reasonDetail: command.reasonDetail, method: command.method || 'MANUAL',
        validFrom: command.validFrom, validTo: command.validTo,
      });
    } catch (error) {
      this.logger.error(`AssignOwnerHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
