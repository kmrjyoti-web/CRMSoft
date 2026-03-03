import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeOwnerCommand } from './revoke-owner.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(RevokeOwnerCommand)
export class RevokeOwnerHandler implements ICommandHandler<RevokeOwnerCommand> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: RevokeOwnerCommand) {
    await this.ownershipCore.revoke({
      entityType: command.entityType, entityId: command.entityId,
      userId: command.userId, ownerType: command.ownerType,
      revokedById: command.revokedById, reason: command.reason,
    });
    return { success: true };
  }
}
