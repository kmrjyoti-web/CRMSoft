// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../core/prisma/cross-db-resolver.service';
import { RoundRobinService } from './round-robin.service';
import { OwnershipCoreService } from './ownership-core.service';

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: CrossDbResolverService,
    private readonly roundRobin: RoundRobinService,
    private readonly ownershipCore: OwnershipCoreService,
  ) {}

  /** Evaluate entity against all active rules. Returns first match by priority. */
  async evaluate(params: { entityType: string; entityId: string; triggerEvent: string }) {
    const rules = await this.prisma.working.assignmentRule.findMany({
      where: { entityType: params.entityType as any, triggerEvent: params.triggerEvent, isActive: true, status: 'ACTIVE' },
      orderBy: { priority: 'asc' },
    });
    if (!rules.length) return null;

    const entity = await this.loadEntityData(params.entityType, params.entityId);
    if (!entity) return null;

    for (const rule of rules) {
      const conditions = (rule.conditions as any[]) || [];
      const allMatch = conditions.every((c) => this.evaluateCondition(entity, c));
      if (allMatch) {
        this.logger.log(`Rule "${rule.name}" matched for ${params.entityType}/${params.entityId}`);
        return rule;
      }
    }

    return null;
  }

  /** Execute a matched rule � perform the assignment. */
  async executeRule(rule: any, entityType: string, entityId: string, performedById: string) {
    let userId: string;

    switch (rule.assignmentMethod) {
      case 'ROUND_ROBIN':
        userId = await this.roundRobin.executeForRule(rule.id, entityType, entityId);
        break;
      case 'WORKLOAD_BALANCE':
        userId = await this.getLowestLoadUser(rule.assignToTeamIds, entityType);
        break;
      case 'MANUAL':
      case 'RULE_BASED':
      default:
        userId = rule.assignToUserId;
        if (!userId && rule.assignToTeamIds?.length) userId = rule.assignToTeamIds[0];
        break;
    }

    if (!userId) {
      this.logger.warn(`No user resolved for rule "${rule.name}"`);
      return null;
    }

    const owner = await this.ownershipCore.assign({
      entityType, entityId, userId,
      ownerType: rule.ownerType || 'PRIMARY_OWNER',
      assignedById: performedById, reason: 'RULE_BASED',
      reasonDetail: `Rule: ${rule.name}`, method: rule.assignmentMethod,
    });

    await this.prisma.working.assignmentRule.update({
      where: { id: rule.id },
      data: { executionCount: { increment: 1 }, lastExecutedAt: new Date() },
    });

    return owner;
  }

  /** Test a rule against an entity (dry run). */
  async testRule(ruleId: string, entityType: string, entityId: string) {
    const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: ruleId } });
    if (!rule) return { ruleMatches: false, reason: 'Rule not found', conditionResults: [] };

    const entity = await this.loadEntityData(entityType, entityId);
    if (!entity) return { ruleMatches: false, reason: 'Entity not found', conditionResults: [] };

    const conditions = (rule.conditions as any[]) || [];
    const results = conditions.map((c) => {
      const actual = this.extractFieldValue(entity, c.field);
      const passed = this.applyOperator(actual, c.operator, c.value);
      return { field: c.field, operator: c.operator, expected: c.value, actual, passed };
    });

    const allPassed = results.every((r) => r.passed);
    let wouldAssignTo: any = null;
    if (allPassed && rule.assignToUserId) {
      wouldAssignTo = await this.resolver.resolveUser(rule.assignToUserId);
    }

    return {
      ruleMatches: allPassed, conditionResults: results, wouldAssignTo,
      reason: allPassed ? 'All conditions met' : `Condition failed: ${results.find((r) => !r.passed)?.field}`,
    };
  }

  /** Extract nested field value from entity. */
  extractFieldValue(entity: Record<string, unknown>, fieldPath: string): Record<string, unknown> {
    if (fieldPath.startsWith('filters.')) {
      const filterKey = fieldPath.split('.')[1];
      const filters = entity.filters || [];
      const match = filters.find((f: Record<string, unknown>) => f.lookupValue?.lookup?.category === filterKey);
      return match?.lookupValue?.value ?? null;
    }
    return fieldPath.split('.').reduce((obj: any, key: string) => obj?.[key], entity);
  }

  private evaluateCondition(entity: Record<string, unknown>, condition: any): boolean {
    const actual = this.extractFieldValue(entity, condition.field);
    return this.applyOperator(actual, condition.operator, condition.value);
  }

  private applyOperator(actual: Record<string, unknown>, operator: string, expected: any): boolean {
    switch (operator) {
      case 'EQUALS': return String(actual) === String(expected);
      case 'NOT_EQUALS': return String(actual) !== String(expected);
      case 'CONTAINS': return String(actual || '').includes(String(expected));
      case 'GREATER_THAN': return Number(actual) > Number(expected);
      case 'LESS_THAN': return Number(actual) < Number(expected);
      case 'IN': return Array.isArray(expected) ? expected.includes(actual) : false;
      case 'NOT_IN': return Array.isArray(expected) ? !expected.includes(actual) : true;
      case 'IS_EMPTY': return !actual || actual === '';
      case 'IS_NOT_EMPTY': return !!actual && actual !== '';
      default: return false;
    }
  }

  private async loadEntityData(entityType: string, entityId: string) {
    switch (entityType) {
      case 'LEAD': {
        const lead = await this.prisma.working.lead.findUnique({
          where: { id: entityId },
          include: { contact: true, organization: true, filters: true },
        });
        if (!lead) return null;
        const enrichedFilters = await this.resolver.resolveLookupValues(lead.filters || [], 'lookupValueId', true);
        return { ...lead, filters: enrichedFilters };
      }
      case 'CONTACT':
        return this.prisma.working.contact.findUnique({ where: { id: entityId }, include: { communications: true } });
      case 'ORGANIZATION':
        return this.prisma.working.organization.findUnique({ where: { id: entityId } });
      case 'QUOTATION':
        return this.prisma.working.quotation.findUnique({ where: { id: entityId }, include: { lead: true } });
      default: return null;
    }
  }

  private async getLowestLoadUser(userIds: string[], entityType: string): Promise<string> {
    if (!userIds?.length) throw new Error('No users in pool');
    const capacities = await this.prisma.userCapacity.findMany({
      where: { userId: { in: userIds }, isAvailable: true },
      orderBy: { activeTotal: 'asc' },
    });
    if (capacities.length) return capacities[0].userId;
    return userIds[0];
  }
}
