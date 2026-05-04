import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkAssignCommand } from './bulk-assign.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@CommandHandler(BulkAssignCommand)
export class BulkAssignHandler implements ICommandHandler<BulkAssignCommand> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(command: BulkAssignCommand) {
    let success = 0;
    let failed = 0;
    const errors: unknown[] = [];

    for (const entityId of command.entityIds) {
      try {
        await this.ownershipCore.assign({
          entityType: command.entityType, entityId,
          userId: command.userId, ownerType: command.ownerType,
          assignedById: command.assignedById, reason: command.reason,
          method: 'MANUAL',
        });
        success++;
      } catch (err) {
        failed++;
        errors.push({ entityId, error: (err as Error).message });
      }
    }

    return { success, failed, errors, total: command.entityIds.length };
  }
}
