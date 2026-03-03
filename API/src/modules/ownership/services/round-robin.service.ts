import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class RoundRobinService {
  private readonly logger = new Logger(RoundRobinService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get next user in rotation pool. Skips unavailable and over-capacity users. */
  async getNextUser(params: {
    userIds: string[]; entityType: string; lastAssignedIndex: number; respectCapacity?: boolean;
  }): Promise<{ userId: string; newIndex: number }> {
    const { userIds, entityType, lastAssignedIndex, respectCapacity } = params;
    if (!userIds.length) throw new BadRequestException('Rotation pool is empty');

    const poolSize = userIds.length;
    for (let i = 0; i < poolSize; i++) {
      const idx = (lastAssignedIndex + 1 + i) % poolSize;
      const userId = userIds[idx];

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.status !== 'ACTIVE') continue;

      const capacity = await this.prisma.userCapacity.findUnique({ where: { userId } });
      if (capacity && !capacity.isAvailable) continue;

      if (respectCapacity && capacity) {
        const field = this.getCapacityField(entityType);
        if (field) {
          const current = (capacity as any)[field.active] || 0;
          const max = (capacity as any)[field.max] || 200;
          if (current >= max) continue;
        }
      }

      this.logger.log(`Round-robin selected user ${userId} at index ${idx}`);
      return { userId, newIndex: idx };
    }

    // Fallback: return first active user ignoring capacity
    for (let i = 0; i < poolSize; i++) {
      const idx = (lastAssignedIndex + 1 + i) % poolSize;
      const user = await this.prisma.user.findUnique({ where: { id: userIds[idx] } });
      if (user && user.status === 'ACTIVE') {
        return { userId: userIds[idx], newIndex: idx };
      }
    }

    throw new BadRequestException('No available users in rotation pool');
  }

  /** Execute round-robin for an assignment rule. */
  async executeForRule(ruleId: string, entityType: string, entityId: string): Promise<string> {
    const rule = await this.prisma.assignmentRule.findUnique({ where: { id: ruleId } });
    if (!rule) throw new BadRequestException('Assignment rule not found');

    const result = await this.getNextUser({
      userIds: rule.assignToTeamIds,
      entityType,
      lastAssignedIndex: rule.lastAssignedIndex,
      respectCapacity: rule.respectWorkload,
    });

    await this.prisma.assignmentRule.update({
      where: { id: ruleId },
      data: { lastAssignedIndex: result.newIndex },
    });

    return result.userId;
  }

  private getCapacityField(entityType: string): { active: string; max: string } | null {
    const map: Record<string, { active: string; max: string }> = {
      LEAD: { active: 'activeLeads', max: 'maxLeads' },
      CONTACT: { active: 'activeContacts', max: 'maxContacts' },
      ORGANIZATION: { active: 'activeOrganizations', max: 'maxOrganizations' },
      QUOTATION: { active: 'activeQuotations', max: 'maxQuotations' },
    };
    return map[entityType] || null;
  }
}
