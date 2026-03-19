import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WorkloadService {
  private readonly logger = new Logger(WorkloadService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Team workload dashboard. */
  async getDashboard(params: { roleId?: string }) {
    const where: any = { status: 'ACTIVE', userType: 'EMPLOYEE' };
    if (params.roleId) where.roleId = params.roleId;

    const users = await this.prisma.user.findMany({
      where, select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
    });

    const userDetails = await Promise.all(users.map(async (u) => {
      const capacity = await this.getOrCreateCapacity(u.id);
      const counts = await this.getActualCounts(u.id);
      const total = counts.leads + counts.contacts + counts.organizations + counts.quotations;
      const loadPercent = capacity.maxTotal > 0 ? Math.round((total / capacity.maxTotal) * 100) : 0;

      return {
        userId: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email, avatar: u.avatar,
        capacity: { maxLeads: capacity.maxLeads, maxContacts: capacity.maxContacts, maxOrganizations: capacity.maxOrganizations, maxQuotations: capacity.maxQuotations, maxTotal: capacity.maxTotal },
        current: { leads: counts.leads, contacts: counts.contacts, organizations: counts.organizations, quotations: counts.quotations, total },
        loadPercent, isAvailable: capacity.isAvailable,
        status: this.getLoadStatus(loadPercent),
        lastActivityAt: capacity.lastActivityAt,
      };
    }));

    const available = userDetails.filter((u) => u.isAvailable).length;
    const overloaded = userDetails.filter((u) => u.loadPercent > 90).length;
    const underutilized = userDetails.filter((u) => u.loadPercent < 20).length;
    const avgLoad = userDetails.length ? Math.round(userDetails.reduce((s, u) => s + u.loadPercent, 0) / userDetails.length) : 0;

    return {
      users: userDetails,
      summary: { totalUsers: userDetails.length, availableUsers: available, avgLoad, overloaded, underutilized },
    };
  }

  /** Single user detailed workload. */
  async getUserWorkload(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, firstName: true, lastName: true, email: true } });
    const capacity = await this.getOrCreateCapacity(userId);
    const counts = await this.getActualCounts(userId);
    const total = counts.leads + counts.contacts + counts.organizations + counts.quotations;
    const loadPercent = capacity.maxTotal > 0 ? Math.round((total / capacity.maxTotal) * 100) : 0;

    const recentActivity = await this.prisma.working.ownershipLog.findMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      orderBy: { createdAt: 'desc' }, take: 5,
    });

    const delegatedFrom = await this.prisma.working.entityOwner.findMany({
      where: { userId, ownerType: 'DELEGATED_OWNER', isActive: true },
    });

    return {
      user, capacity, current: { ...counts, total }, loadPercent,
      status: this.getLoadStatus(loadPercent),
      recentActivity, delegatedFrom: delegatedFrom.length,
      isOnLeave: !capacity.isAvailable,
      leaveEndDate: capacity.unavailableTo,
    };
  }

  /** Rebalance suggestions — who's overloaded, who can take more. */
  async getRebalanceSuggestions() {
    const dashboard = await this.getDashboard({});
    const overloaded = dashboard.users.filter((u) => u.loadPercent > 80).sort((a, b) => b.loadPercent - a.loadPercent);
    const underutilized = dashboard.users.filter((u) => u.loadPercent < 30 && u.isAvailable).sort((a, b) => a.loadPercent - b.loadPercent);

    const suggestions: any[] = [];
    for (const from of overloaded) {
      if (!underutilized.length) break;
      const to = underutilized[0];

      const entityType = from.current.leads > 0 ? 'LEAD' : from.current.contacts > 0 ? 'CONTACT' : 'ORGANIZATION';
      const count = Math.min(5, from.current[entityType === 'LEAD' ? 'leads' : entityType === 'CONTACT' ? 'contacts' : 'organizations']);
      if (count === 0) continue;

      const entities = await this.prisma.working.entityOwner.findMany({
        where: { userId: from.userId, entityType: entityType as any, isActive: true },
        orderBy: { createdAt: 'asc' }, take: count,
      });

      suggestions.push({
        suggestion: `Transfer ${count} ${entityType.toLowerCase()}s from ${from.name} (${from.loadPercent}% load) to ${to.name} (${to.loadPercent}% load)`,
        fromUser: { id: from.userId, name: from.name, loadPercent: from.loadPercent },
        toUser: { id: to.userId, name: to.name, loadPercent: to.loadPercent },
        entityType, count, entityIds: entities.map((e) => e.entityId),
        impact: {
          fromUserNewLoad: Math.max(0, from.loadPercent - Math.round((count / from.current.total) * 100)),
          toUserNewLoad: to.loadPercent + Math.round((count / (to.capacity.maxTotal || 200)) * 100),
        },
      });
    }

    return suggestions;
  }

  /** Recalculate actual counts for a user. */
  async recalculateCounts(userId: string) {
    const counts = await this.getActualCounts(userId);
    const total = counts.leads + counts.contacts + counts.organizations + counts.quotations;

    return this.prisma.userCapacity.upsert({
      where: { userId },
      create: { userId, activeLeads: counts.leads, activeContacts: counts.contacts, activeOrganizations: counts.organizations, activeQuotations: counts.quotations, activeTotal: total },
      update: { activeLeads: counts.leads, activeContacts: counts.contacts, activeOrganizations: counts.organizations, activeQuotations: counts.quotations, activeTotal: total },
    });
  }

  /** Set user availability. */
  async setAvailability(params: {
    userId: string; isAvailable: boolean;
    unavailableFrom?: Date; unavailableTo?: Date; delegateToId?: string;
  }) {
    return this.prisma.userCapacity.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId, isAvailable: params.isAvailable,
        unavailableFrom: params.unavailableFrom, unavailableTo: params.unavailableTo,
        delegateToId: params.delegateToId,
      },
      update: {
        isAvailable: params.isAvailable,
        unavailableFrom: params.unavailableFrom, unavailableTo: params.unavailableTo,
        delegateToId: params.delegateToId,
      },
    });
  }

  /** Get or create UserCapacity. */
  async getOrCreateCapacity(userId: string) {
    const existing = await this.prisma.userCapacity.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.userCapacity.create({ data: { userId } });
  }

  private async getActualCounts(userId: string) {
    const owners = await this.prisma.working.entityOwner.groupBy({
      by: ['entityType'], where: { userId, isActive: true }, _count: true,
    });
    const map: Record<string, number> = {};
    for (const g of owners) map[g.entityType] = g._count;

    return {
      leads: map['LEAD'] || 0, contacts: map['CONTACT'] || 0,
      organizations: map['ORGANIZATION'] || 0, quotations: map['QUOTATION'] || 0,
    };
  }

  private getLoadStatus(percent: number): string {
    if (percent <= 50) return 'NORMAL';
    if (percent <= 75) return 'HEAVY';
    if (percent <= 90) return 'OVERLOADED';
    return 'CRITICAL';
  }
}
