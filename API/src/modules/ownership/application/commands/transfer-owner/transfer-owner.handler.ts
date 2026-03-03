import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferOwnerCommand } from './transfer-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(TransferOwnerCommand)
export class TransferOwnerHandler implements ICommandHandler<TransferOwnerCommand> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: TransferOwnerCommand) {
    return this.ownershipCore.transfer({
      entityType: command.entityType, entityId: command.entityId,
      fromUserId: command.fromUserId, toUserId: command.toUserId,
      ownerType: command.ownerType, transferredById: command.transferredById,
      reason: command.reason, reasonDetail: command.reasonDetail,
    });
  }
}
