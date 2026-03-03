import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DelegateOwnershipCommand } from './delegate-ownership.command';
import { DelegationService } from '../../../services/delegation.service';

@CommandHandler(DelegateOwnershipCommand)
export class DelegateOwnershipHandler implements ICommandHandler<DelegateOwnershipCommand> {
  constructor(private readonly delegation: DelegationService) {}

  async execute(command: DelegateOwnershipCommand) {
    return this.delegation.delegate({
      fromUserId: command.fromUserId, toUserId: command.toUserId,
      entityType: command.entityType, startDate: command.startDate,
      endDate: command.endDate, reason: command.reason,
      delegatedById: command.delegatedById,
    });
  }
}
