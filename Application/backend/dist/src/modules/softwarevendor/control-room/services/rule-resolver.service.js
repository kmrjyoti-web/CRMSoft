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
var RuleResolverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const LEVEL_PRIORITY = {
    INDUSTRY: 1,
    WORKING: 2,
    ACCOUNTING: 3,
    INVENTORY: 4,
    CONTROL_ROOM: 5,
    PAGE: 6,
    RBAC: 7,
};
let RuleResolverService = RuleResolverService_1 = class RuleResolverService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RuleResolverService_1.name);
    }
    async resolveRule(tenantId, ruleCode, context) {
        const rule = await this.prisma.controlRoomRule.findUnique({
            where: { ruleCode },
            include: {
                values: {
                    where: {
                        isActive: true,
                        OR: [
                            { tenantId: null, level: 'INDUSTRY' },
                            { tenantId, level: { in: ['WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'] } },
                            ...(context?.pageCode
                                ? [{ tenantId, level: 'PAGE', pageCode: context.pageCode }]
                                : []),
                            ...(context?.roleIds?.length
                                ? [{ tenantId, level: 'RBAC', roleId: { in: context.roleIds }, userId: null }]
                                : []),
                            ...(context?.userId
                                ? [{ tenantId, level: 'RBAC', userId: context.userId }]
                                : []),
                        ],
                    },
                    orderBy: { setAt: 'desc' },
                },
            },
        });
        if (!rule)
            return null;
        const values = rule.values.filter((v) => {
            if (v.level === 'INDUSTRY' && context?.industryCode) {
                return v.industryCode === context.industryCode;
            }
            if (v.level === 'INDUSTRY' && !context?.industryCode) {
                return false;
            }
            return true;
        });
        const winner = this.pickWinner(values);
        return {
            value: this.parseValue(winner?.value ?? rule.defaultValue, rule.valueType),
            level: winner?.level ?? 'DEFAULT',
            valueType: rule.valueType,
            label: rule.label,
            category: rule.category,
        };
    }
    async resolveAllRules(tenantId, userId, roleIds, industryCode) {
        const rules = await this.prisma.controlRoomRule.findMany({
            where: { isActive: true },
            include: {
                values: {
                    where: {
                        isActive: true,
                        OR: [
                            { tenantId: null, level: 'INDUSTRY' },
                            { tenantId, level: { in: ['WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'] } },
                            { tenantId, level: 'PAGE' },
                            ...(roleIds.length
                                ? [{ tenantId, level: 'RBAC', roleId: { in: roleIds }, userId: null }]
                                : []),
                            { tenantId, level: 'RBAC', userId },
                        ],
                    },
                    orderBy: { setAt: 'desc' },
                },
            },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
        const result = {};
        for (const rule of rules) {
            const values = rule.values.filter((v) => {
                if (v.level === 'INDUSTRY') {
                    return industryCode ? v.industryCode === industryCode : false;
                }
                return true;
            });
            const pageOverrides = {};
            const pageValues = values.filter((v) => v.level === 'PAGE');
            for (const pv of pageValues) {
                if (pv.pageCode) {
                    pageOverrides[pv.pageCode] = this.parseValue(pv.value, rule.valueType);
                }
            }
            const nonPageValues = values.filter((v) => v.level !== 'PAGE');
            const winner = this.pickWinner(nonPageValues);
            result[rule.ruleCode] = {
                value: this.parseValue(winner?.value ?? rule.defaultValue, rule.valueType),
                level: winner?.level ?? 'DEFAULT',
                pageOverrides: Object.keys(pageOverrides).length > 0 ? pageOverrides : undefined,
                valueType: rule.valueType,
                label: rule.label,
                category: rule.category,
            };
        }
        return result;
    }
    async getCacheVersion(tenantId) {
        const record = await this.prisma.tenantRuleCacheVersion.findUnique({
            where: { tenantId },
        });
        return {
            version: record?.version ?? 0,
            lastChangedAt: record?.lastChangedAt ?? new Date(0),
        };
    }
    async incrementCacheVersion(tenantId, userId) {
        const result = await this.prisma.tenantRuleCacheVersion.upsert({
            where: { tenantId },
            update: {
                version: { increment: 1 },
                lastChangedAt: new Date(),
                lastChangedBy: userId,
            },
            create: {
                tenantId,
                version: 1,
                lastChangedAt: new Date(),
                lastChangedBy: userId,
            },
        });
        this.logger.log(`Cache version bumped to ${result.version} for tenant ${tenantId}`);
        return result.version;
    }
    pickWinner(values) {
        if (values.length === 0)
            return null;
        let best = values[0];
        let bestPriority = this.getLevelPriority(best);
        for (let i = 1; i < values.length; i++) {
            const v = values[i];
            const priority = this.getLevelPriority(v);
            if (priority > bestPriority) {
                best = v;
                bestPriority = priority;
            }
            else if (priority === bestPriority && v.level === 'RBAC') {
                if (v.userId && !best.userId) {
                    best = v;
                    bestPriority = priority;
                }
            }
        }
        return best;
    }
    getLevelPriority(v) {
        const base = LEVEL_PRIORITY[v.level] ?? 0;
        if (v.level === 'RBAC' && v.userId)
            return base + 0.5;
        return base;
    }
    parseValue(raw, valueType) {
        if (raw === null || raw === undefined)
            return null;
        switch (valueType) {
            case 'BOOLEAN':
                return raw === 'true' || raw === '1';
            case 'NUMBER':
                return Number(raw);
            case 'JSON':
            case 'MULTI_SELECT':
                try {
                    return JSON.parse(raw);
                }
                catch {
                    return raw;
                }
            default:
                return raw;
        }
    }
};
exports.RuleResolverService = RuleResolverService;
exports.RuleResolverService = RuleResolverService = RuleResolverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RuleResolverService);
//# sourceMappingURL=rule-resolver.service.js.map