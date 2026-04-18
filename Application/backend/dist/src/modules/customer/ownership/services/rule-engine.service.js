"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RuleEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../core/prisma/cross-db-resolver.service");
const round_robin_service_1 = require("./round-robin.service");
const ownership_core_service_1 = require("./ownership-core.service");
let RuleEngineService = RuleEngineService_1 = class RuleEngineService {
    constructor(prisma, resolver, roundRobin, ownershipCore) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.roundRobin = roundRobin;
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(RuleEngineService_1.name);
    }
    async evaluate(params) {
        const rules = await this.prisma.working.assignmentRule.findMany({
            where: { entityType: params.entityType, triggerEvent: params.triggerEvent, isActive: true, status: 'ACTIVE' },
            orderBy: { priority: 'asc' },
        });
        if (!rules.length)
            return null;
        const entity = await this.loadEntityData(params.entityType, params.entityId);
        if (!entity)
            return null;
        for (const rule of rules) {
            const conditions = rule.conditions || [];
            const allMatch = conditions.every((c) => this.evaluateCondition(entity, c));
            if (allMatch) {
                this.logger.log(`Rule "${rule.name}" matched for ${params.entityType}/${params.entityId}`);
                return rule;
            }
        }
        return null;
    }
    async executeRule(rule, entityType, entityId, performedById) {
        let userId;
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
                if (!userId && rule.assignToTeamIds?.length)
                    userId = rule.assignToTeamIds[0];
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
    async testRule(ruleId, entityType, entityId) {
        const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: ruleId } });
        if (!rule)
            return { ruleMatches: false, reason: 'Rule not found', conditionResults: [] };
        const entity = await this.loadEntityData(entityType, entityId);
        if (!entity)
            return { ruleMatches: false, reason: 'Entity not found', conditionResults: [] };
        const conditions = rule.conditions || [];
        const results = conditions.map((c) => {
            const actual = this.extractFieldValue(entity, c.field);
            const passed = this.applyOperator(actual, c.operator, c.value);
            return { field: c.field, operator: c.operator, expected: c.value, actual, passed };
        });
        const allPassed = results.every((r) => r.passed);
        let wouldAssignTo = null;
        if (allPassed && rule.assignToUserId) {
            wouldAssignTo = await this.resolver.resolveUser(rule.assignToUserId);
        }
        return {
            ruleMatches: allPassed, conditionResults: results, wouldAssignTo,
            reason: allPassed ? 'All conditions met' : `Condition failed: ${results.find((r) => !r.passed)?.field}`,
        };
    }
    extractFieldValue(entity, fieldPath) {
        if (fieldPath.startsWith('filters.')) {
            const filterKey = fieldPath.split('.')[1];
            const filters = entity.filters || [];
            const match = filters.find((f) => f.lookupValue?.lookup?.category === filterKey);
            return match?.lookupValue?.value ?? null;
        }
        return fieldPath.split('.').reduce((obj, key) => obj?.[key], entity);
    }
    evaluateCondition(entity, condition) {
        const actual = this.extractFieldValue(entity, condition.field);
        return this.applyOperator(actual, condition.operator, condition.value);
    }
    applyOperator(actual, operator, expected) {
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
    async loadEntityData(entityType, entityId) {
        switch (entityType) {
            case 'LEAD': {
                const lead = await this.prisma.working.lead.findUnique({
                    where: { id: entityId },
                    include: { contact: true, organization: true, filters: true },
                });
                if (!lead)
                    return null;
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
    async getLowestLoadUser(userIds, entityType) {
        if (!userIds?.length)
            throw new Error('No users in pool');
        const capacities = await this.prisma.userCapacity.findMany({
            where: { userId: { in: userIds }, isAvailable: true },
            orderBy: { activeTotal: 'asc' },
        });
        if (capacities.length)
            return capacities[0].userId;
        return userIds[0];
    }
};
exports.RuleEngineService = RuleEngineService;
exports.RuleEngineService = RuleEngineService = RuleEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService,
        round_robin_service_1.RoundRobinService,
        ownership_core_service_1.OwnershipCoreService])
], RuleEngineService);
//# sourceMappingURL=rule-engine.service.js.map