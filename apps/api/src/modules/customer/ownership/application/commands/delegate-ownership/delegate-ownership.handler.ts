import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DelegateOwnershipCommand } from './delegate-ownership.command';
import { DelegationService } from '../../../services/delegation.service';

@CommandHandler(DelegateOwnershipCommand)
export class DelegateOwnershipHandler implements ICommandHandler<DelegateOwnershipCommand> {
    private readonly logger = new Logger(DelegateOwnershipHandler.name);

  constructor(private readonly delegation: DelegationService) {}

  async execute(command: DelegateOwnershipCommand) {
    try {
      return this.delegation.delegate({
        fromUserId: command.fromUserId, toUserId: command.toUserId,
        entityType: command.entityType, startDate: command.startDate,
        endDate: command.endDate, reason: command.reason,
        delegatedById: command.delegatedById,
      });
    } catch (error) {
      this.logger.error(`DelegateOwnershipHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
