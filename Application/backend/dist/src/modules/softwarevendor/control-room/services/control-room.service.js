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
var ControlRoomService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlRoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const rule_resolver_service_1 = require("./rule-resolver.service");
let ControlRoomService = ControlRoomService_1 = class ControlRoomService {
    constructor(prisma, ruleResolver) {
        this.prisma = prisma;
        this.ruleResolver = ruleResolver;
        this.logger = new common_1.Logger(ControlRoomService_1.name);
    }
    async getRulesGrouped(tenantId) {
        const rules = await this.prisma.controlRoomRule.findMany({
            where: { isActive: true },
            include: {
                values: {
                    where: {
                        isActive: true,
                        OR: [
                            { tenantId: null, level: 'INDUSTRY' },
                            { tenantId },
                        ],
                    },
                    orderBy: { setAt: 'desc' },
                },
            },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
        const grouped = {};
        for (const rule of rules) {
            if (!grouped[rule.category]) {
                grouped[rule.category] = [];
            }
            const tenantValues = rule.values.filter((v) => v.tenantId === tenantId || v.tenantId === null);
            let effectiveValue = rule.defaultValue;
            let effectiveLevel = 'DEFAULT';
            const levelOrder = ['INDUSTRY', 'WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'];
            for (const lvl of levelOrder) {
                const match = tenantValues.find((v) => v.level === lvl);
                if (match) {
                    effectiveValue = match.value;
                    effectiveLevel = match.level;
                }
            }
            const levelValues = {};
            for (const v of tenantValues) {
                if (!v.pageCode && !v.roleId && !v.userId) {
                    levelValues[v.level] = {
                        value: v.value,
                        setBy: v.setByUserName ?? undefined,
                        setAt: v.setAt,
                    };
                }
            }
            grouped[rule.category].push({
                id: rule.id,
                ruleCode: rule.ruleCode,
                label: rule.label,
                description: rule.description,
                helpUrl: rule.helpUrl,
                valueType: rule.valueType,
                defaultValue: rule.defaultValue,
                selectOptions: rule.selectOptions,
                minValue: rule.minValue ? Number(rule.minValue) : null,
                maxValue: rule.maxValue ? Number(rule.maxValue) : null,
                allowedLevels: rule.allowedLevels,
                subCategory: rule.subCategory,
                industrySpecific: rule.industrySpecific,
                requiresModule: rule.requiresModule,
                effectiveValue,
                effectiveLevel,
                levelValues,
            });
        }
        return grouped;
    }
    async updateRule(tenantId, ruleCode, newValue, level, context) {
        const rule = await this.prisma.controlRoomRule.findUnique({
            where: { ruleCode },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Rule '${ruleCode}' not found`);
        }
        const allowedLevels = rule.allowedLevels ?? [];
        if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
            throw new common_1.BadRequestException(`Level '${level}' is not allowed for rule '${ruleCode}'. Allowed: ${allowedLevels.join(', ')}`);
        }
        const stringValue = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue);
        const pageCode = level === 'PAGE' ? (context.pageCode ?? null) : null;
        const roleId = level === 'RBAC' ? (context.roleId ?? null) : null;
        const userId = level === 'RBAC' ? (context.targetUserId ?? null) : null;
        const valueTenantId = level === 'INDUSTRY' ? null : tenantId;
        const existing = await this.prisma.controlRoomValue.findFirst({
            where: {
                tenantId: valueTenantId,
                ruleId: rule.id,
                level,
                pageCode,
                roleId,
                userId,
                isActive: true,
            },
        });
        const previousValue = existing?.value ?? null;
        const result = await this.prisma.$transaction(async (tx) => {
            const value = existing
                ? await tx.controlRoomValue.update({
                    where: { id: existing.id },
                    data: {
                        value: stringValue,
                        setByUserId: context.userId,
                        setByUserName: context.userName,
                        setAt: new Date(),
                    },
                })
                : await tx.controlRoomValue.create({
                    data: {
                        tenantId: valueTenantId,
                        ruleId: rule.id,
                        level,
                        value: stringValue,
                        pageCode,
                        roleId,
                        userId,
                        setByUserId: context.userId,
                        setByUserName: context.userName,
                        isActive: true,
                    },
                });
            await tx.controlRoomAuditLog.create({
                data: {
                    tenantId,
                    ruleId: rule.id,
                    ruleCode,
                    level,
                    previousValue,
                    newValue: stringValue,
                    pageCode,
                    roleId,
                    userId,
                    changedByUserId: context.userId,
                    changedByUserName: context.userName,
                    changeReason: context.changeReason,
                    ipAddress: context.ipAddress,
                },
            });
            return value;
        });
        await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);
        this.logger.log(`Rule '${ruleCode}' updated at level '${level}' by ${context.userName} (tenant: ${tenantId})`);
        return result;
    }
    async getAuditTrail(tenantId, ruleCode, options) {
        const page = options?.page ?? 1;
        const limit = Math.min(options?.limit ?? 50, 200);
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (ruleCode)
            where.ruleCode = ruleCode;
        if (options?.level)
            where.level = options.level;
        if (options?.changedByUserId)
            where.changedByUserId = options.changedByUserId;
        if (options?.startDate || options?.endDate) {
            where.createdAt = {};
            if (options?.startDate)
                where.createdAt.gte = options.startDate;
            if (options?.endDate)
                where.createdAt.lte = options.endDate;
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.controlRoomAuditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.controlRoomAuditLog.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async resetRule(tenantId, ruleCode, level, context) {
        const rule = await this.prisma.controlRoomRule.findUnique({
            where: { ruleCode },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Rule '${ruleCode}' not found`);
        }
        const valueTenantId = level === 'INDUSTRY' ? null : tenantId;
        const pageCode = level === 'PAGE' ? (context.pageCode ?? null) : null;
        const roleId = level === 'RBAC' ? (context.roleId ?? null) : null;
        const userId = level === 'RBAC' ? (context.targetUserId ?? null) : null;
        const existing = await this.prisma.controlRoomValue.findFirst({
            where: {
                tenantId: valueTenantId,
                ruleId: rule.id,
                level,
                pageCode,
                roleId,
                userId,
                isActive: true,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`No active override found for rule '${ruleCode}' at level '${level}'`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.controlRoomValue.update({
                where: { id: existing.id },
                data: { isActive: false },
            });
            await tx.controlRoomAuditLog.create({
                data: {
                    tenantId,
                    ruleId: rule.id,
                    ruleCode,
                    level,
                    previousValue: existing.value,
                    newValue: '__RESET__',
                    pageCode,
                    roleId,
                    userId,
                    changedByUserId: context.userId,
                    changedByUserName: context.userName,
                    changeReason: context.changeReason ?? `Reset level '${level}' override`,
                    ipAddress: context.ipAddress,
                },
            });
        });
        await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);
        this.logger.log(`Rule '${ruleCode}' reset at level '${level}' by ${context.userName} (tenant: ${tenantId})`);
        return { ruleCode, level, status: 'reset' };
    }
    async saveDraft(tenantId, ruleCode, newValue, level, context) {
        const rule = await this.prisma.controlRoomRule.findUnique({ where: { ruleCode } });
        if (!rule)
            throw new common_1.NotFoundException(`Rule '${ruleCode}' not found`);
        const stringValue = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue);
        const existing = await this.prisma.controlRoomValue.findFirst({
            where: { tenantId, ruleId: rule.id, level, isActive: true },
        });
        await this.prisma.controlRoomDraft.upsert({
            where: { tenantId_ruleId_level: { tenantId, ruleId: rule.id, level } },
            create: {
                tenantId, ruleId: rule.id, ruleCode, level,
                previousValue: existing?.value ?? rule.defaultValue,
                newValue: stringValue,
                createdByUserId: context.userId,
                createdByUserName: context.userName,
            },
            update: {
                newValue: stringValue,
                status: 'DRAFT',
            },
        });
        return { ruleCode, newValue, status: 'DRAFT' };
    }
    async getPendingDrafts(tenantId) {
        return this.prisma.controlRoomDraft.findMany({
            where: { tenantId, status: 'DRAFT' },
            include: { rule: { select: { label: true, valueType: true, selectOptions: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async discardDraft(tenantId, draftId) {
        await this.prisma.controlRoomDraft.deleteMany({ where: { id: draftId, tenantId, status: 'DRAFT' } });
    }
    async discardAllDrafts(tenantId) {
        await this.prisma.controlRoomDraft.deleteMany({ where: { tenantId, status: 'DRAFT' } });
    }
    async applyAllDrafts(tenantId, context) {
        const drafts = await this.prisma.controlRoomDraft.findMany({
            where: { tenantId, status: 'DRAFT' },
            include: { rule: { select: { label: true } } },
        });
        if (drafts.length === 0)
            throw new common_1.BadRequestException('No pending changes to apply');
        const batchId = drafts[0].id;
        await this.prisma.$transaction(async (tx) => {
            for (const draft of drafts) {
                const existing = await tx.controlRoomValue.findFirst({
                    where: { tenantId, ruleId: draft.ruleId, level: draft.level, isActive: true },
                });
                if (existing) {
                    await tx.controlRoomValue.update({
                        where: { id: existing.id },
                        data: { value: draft.newValue, setByUserId: context.userId, setByUserName: context.userName, setAt: new Date() },
                    });
                }
                else {
                    await tx.controlRoomValue.create({
                        data: {
                            tenantId, ruleId: draft.ruleId, level: draft.level,
                            value: draft.newValue,
                            setByUserId: context.userId, setByUserName: context.userName,
                        },
                    });
                }
                await tx.controlRoomAuditLog.create({
                    data: {
                        tenantId, ruleId: draft.ruleId, ruleCode: draft.ruleCode, level: draft.level,
                        previousValue: draft.previousValue, newValue: draft.newValue,
                        changedByUserId: context.userId, changedByUserName: context.userName,
                        changeReason: context.changeReason, ipAddress: context.ipAddress,
                        batchId,
                    },
                });
                await tx.controlRoomDraft.update({
                    where: { id: draft.id },
                    data: { status: 'APPLIED', appliedAt: new Date() },
                });
            }
            await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);
        });
        return {
            appliedCount: drafts.length,
            changes: drafts.map((d) => ({
                ruleCode: d.ruleCode,
                label: d.rule.label,
                previousValue: d.previousValue,
                newValue: d.newValue,
            })),
        };
    }
};
exports.ControlRoomService = ControlRoomService;
exports.ControlRoomService = ControlRoomService = ControlRoomService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rule_resolver_service_1.RuleResolverService])
], ControlRoomService);
//# sourceMappingURL=control-room.service.js.map