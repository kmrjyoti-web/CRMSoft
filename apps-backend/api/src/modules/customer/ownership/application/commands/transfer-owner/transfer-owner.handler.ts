import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TransferOwnerCommand } from './transfer-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(TransferOwnerCommand)
export class TransferOwnerHandler implements ICommandHandler<TransferOwnerCommand> {
    private readonly logger = new Logger(TransferOwnerHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: TransferOwnerCommand) {
    try {
      return this.ownershipCore.transfer({
        entityType: command.entityType, entityId: command.entityId,
        fromUserId: command.fromUserId, toUserId: command.toUserId,
        ownerType: command.ownerType, transferredById: command.transferredById,
        reason: command.reason, reasonDetail: command.reasonDetail,
      });
    } catch (error) {
      this.logger.error(`TransferOwnerHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
