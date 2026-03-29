import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReassignmentPreviewQuery } from './get-reassignment-preview.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkloadService } from '../../../services/workload.service';

@QueryHandler(GetReassignmentPreviewQuery)
export class GetReassignmentPreviewHandler implements IQueryHandler<GetReassignmentPreviewQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workload: WorkloadService,
  ) {}

  async execute(query: GetReassignmentPreviewQuery) {
    const where: any = { userId: query.fromUserId, isActive: true };
    if (query.entityType) where.entityType = query.entityType;

    const ownerships = await this.prisma.working.entityOwner.findMany({ where });

    const byType: Record<string, number> = {};
    for (const o of ownerships) byType[o.entityType] = (byType[o.entityType] || 0) + 1;

    const fromUser = await this.prisma.user.findUnique({
      where: { id: query.fromUserId }, select: { firstName: true, lastName: true },
    });
    const fromCapacity = await this.workload.getOrCreateCapacity(query.fromUserId);

    let toUserInfo: any = null;
    if (query.toUserId) {
      const toUser = await this.prisma.user.findUnique({
        where: { id: query.toUserId }, select: { firstName: true, lastName: true },
      });
      const toCapacity = await this.workload.getOrCreateCapacity(query.toUserId);
      const remaining = toCapacity.maxTotal - toCapacity.activeTotal;
      toUserInfo = {
        name: toUser ? `${toUser.firstName} ${toUser.lastName}` : '',
        currentLoad: toCapacity.activeTotal,
        capacityRemaining: remaining,
        wouldExceedCapacity: ownerships.length > remaining,
      };
    }

    const warnings: string[] = [];
    if (toUserInfo?.wouldExceedCapacity) {
      warnings.push(`Transferring ${ownerships.length} entities would exceed target user capacity (${toUserInfo.capacityRemaining} remaining)`);
    }

    return {
      fromUser: { name: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : '', currentLoad: fromCapacity.activeTotal },
      toUser: toUserInfo,
      entitiesToTransfer: ownerships.length, byType, warnings,
    };
  }
}
