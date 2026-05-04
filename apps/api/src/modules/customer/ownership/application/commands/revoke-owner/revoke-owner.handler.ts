import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RevokeOwnerCommand } from './revoke-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(RevokeOwnerCommand)
export class RevokeOwnerHandler implements ICommandHandler<RevokeOwnerCommand> {
    private readonly logger = new Logger(RevokeOwnerHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: RevokeOwnerCommand) {
    try {
      await this.ownershipCore.revoke({
        entityType: command.entityType, entityId: command.entityId,
        userId: command.userId, ownerType: command.ownerType,
        revokedById: command.revokedById, reason: command.reason,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`RevokeOwnerHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
