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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let TenantAuditService = class TenantAuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('TenantAudit');
        this.activeAudits = new Map();
        void this.loadActiveAudits();
    }
    async loadActiveAudits() {
        try {
            const active = await this.prisma.identity.tenantAuditSession.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, tenantId: true },
            });
            for (const s of active) {
                this.activeAudits.set(s.tenantId, { id: s.id, tenantId: s.tenantId });
            }
            this.logger.log(`Loaded ${active.length} active audit sessions`);
        }
        catch (err) {
            this.logger.warn('Could not load active audit sessions (table may not exist yet)');
        }
    }
    getActiveAudit(tenantId) {
        return this.activeAudits.get(tenantId) || null;
    }
    async startAudit(tenantId, startedById, startedByName, reason, scheduledDays) {
        const existing = await this.prisma.identity.tenantAuditSession.findFirst({
            where: { tenantId, status: 'ACTIVE' },
        });
        if (existing) {
            throw new Error('An audit session is already active for this tenant');
        }
        const scheduledEndAt = scheduledDays
            ? new Date(Date.now() + scheduledDays * 86_400_000)
            : undefined;
        const session = await this.prisma.identity.tenantAuditSession.create({
            data: { tenantId, startedById, startedByName, reason, scheduledEndAt },
        });
        this.activeAudits.set(tenantId, { id: session.id, tenantId });
        return session;
    }
    async stopAudit(tenantId) {
        const session = await this.prisma.identity.tenantAuditSession.findFirst({
            where: { tenantId, status: 'ACTIVE' },
        });
        if (!session) {
            throw new Error('No active audit session for this tenant');
        }
        const uniqueUsersResult = await this.prisma.identity.tenantAuditLog.groupBy({
            by: ['userId'],
            where: { sessionId: session.id },
        });
        const updated = await this.prisma.identity.tenantAuditSession.update({
            where: { id: session.id },
            data: {
                status: 'COMPLETED',
                endedAt: new Date(),
                uniqueUsers: uniqueUsersResult.length,
            },
        });
        this.activeAudits.delete(tenantId);
        return updated;
    }
    async getAuditStatus(tenantId) {
        return this.prisma.identity.tenantAuditSession.findFirst({
            where: { tenantId, status: 'ACTIVE' },
        });
    }
    async getAuditLogs(sessionId, options) {
        const page = options.page || 1;
        const limit = options.limit || 50;
        const where = { sessionId };
        if (options.userId)
            where.userId = options.userId;
        if (options.actionType)
            where.actionType = options.actionType;
        if (options.entityType)
            where.entityType = options.entityType;
        const [data, total] = await Promise.all([
            this.prisma.identity.tenantAuditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.identity.tenantAuditLog.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getLatestSession(tenantId) {
        return this.prisma.identity.tenantAuditSession.findFirst({
            where: { tenantId },
            orderBy: { startedAt: 'desc' },
        });
    }
    async getAuditReport(sessionId) {
        const session = await this.prisma.identity.tenantAuditSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new Error('Audit session not found');
        const [actionBreakdown, userBreakdown, entityBreakdown] = await Promise.all([
            this.prisma.identity.tenantAuditLog.groupBy({
                by: ['actionType'],
                where: { sessionId },
                _count: { id: true },
            }),
            this.prisma.identity.tenantAuditLog.groupBy({
                by: ['userId', 'userName'],
                where: { sessionId },
                _count: { id: true },
            }),
            this.prisma.identity.tenantAuditLog.groupBy({
                by: ['entityType'],
                where: { sessionId },
                _count: { id: true },
            }),
        ]);
        return {
            session,
            summary: {
                totalActions: session.totalActions,
                uniqueUsers: session.uniqueUsers,
                byAction: actionBreakdown.map((a) => ({
                    action: a.actionType,
                    count: a._count.id,
                })),
                byUser: userBreakdown.map((u) => ({
                    userId: u.userId,
                    userName: u.userName,
                    count: u._count.id,
                })),
                byEntity: entityBreakdown.map((e) => ({
                    entityType: e.entityType,
                    count: e._count.id,
                })),
            },
        };
    }
    async getAuditHistory(tenantId) {
        return this.prisma.identity.tenantAuditSession.findMany({
            where: { tenantId },
            orderBy: { startedAt: 'desc' },
            take: 20,
        });
    }
    async getAllActiveAudits() {
        return this.prisma.identity.tenantAuditSession.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { startedAt: 'desc' },
        });
    }
    async logActivity(data) {
        await this.prisma.identity.tenantAuditLog.create({ data: data });
        await this.prisma.identity.tenantAuditSession.update({
            where: { id: data.sessionId },
            data: { totalActions: { increment: 1 } },
        });
    }
};
exports.TenantAuditService = TenantAuditService;
exports.TenantAuditService = TenantAuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantAuditService);
//# sourceMappingURL=tenant-audit.service.js.map