import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkTransferCommand } from './bulk-transfer.command';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(BulkTransferCommand)
export class BulkTransferHandler implements ICommandHandler<BulkTransferCommand> {
  constructor(
    private readonly ownershipCore: OwnershipCoreService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: BulkTransferCommand) {
    const where: any = { userId: command.fromUserId, isActive: true };
    if (command.entityType) where.entityType = command.entityType;

    const ownerships = await this.prisma.entityOwner.findMany({ where });
    let transferred = 0;
    let failed = 0;
    const byType: Record<string, number> = {};

    for (const o of ownerships) {
      try {
        await this.ownershipCore.transfer({
          entityType: o.entityType, entityId: o.entityId,
          fromUserId: command.fromUserId, toUserId: command.toUserId,
          ownerType: o.ownerType, transferredById: command.transferredById,
          reason: command.reason, reasonDetail: command.reasonDetail,
        });
        transferred++;
        byType[o.entityType] = (byType[o.entityType] || 0) + 1;
      } catch {
        failed++;
      }
    }

    return { transferred, byType, failed, total: ownerships.length };
  }
}
