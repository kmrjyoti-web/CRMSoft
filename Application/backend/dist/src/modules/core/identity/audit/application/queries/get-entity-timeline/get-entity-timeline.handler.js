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
var GetEntityTimelineHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityTimelineHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_entity_timeline_query_1 = require("./get-entity-timeline.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const audit_snapshot_service_1 = require("../../../services/audit-snapshot.service");
const ACTION_ICONS = {
    CREATE: '?', UPDATE: '??', DELETE: '???', STATUS_CHANGE: '??',
    SOFT_DELETE: '??', RESTORE: '??', BULK_UPDATE: '??', EXPORT: '??',
};
const ACTION_COLORS = {
    CREATE: '#10B981', UPDATE: '#3B82F6', DELETE: '#EF4444', STATUS_CHANGE: '#8B5CF6',
    SOFT_DELETE: '#F59E0B', RESTORE: '#06B6D4', BULK_UPDATE: '#EC4899', EXPORT: '#F97316',
};
let GetEntityTimelineHandler = GetEntityTimelineHandler_1 = class GetEntityTimelineHandler {
    constructor(prisma, snapshotService) {
        this.prisma = prisma;
        this.snapshotService = snapshotService;
        this.logger = new common_1.Logger(GetEntityTimelineHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const skip = (page - 1) * limit;
            const where = {
                entityType: query.entityType,
                entityId: query.entityId,
            };
            if (query.action)
                where.action = query.action;
            if (query.dateFrom || query.dateTo) {
                where.createdAt = {};
                if (query.dateFrom)
                    where.createdAt.gte = query.dateFrom;
                if (query.dateTo)
                    where.createdAt.lte = query.dateTo;
            }
            const [logs, total] = await Promise.all([
                this.prisma.identity.auditLog.findMany({
                    where,
                    include: { fieldChanges: true },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.identity.auditLog.count({ where }),
            ]);
            const currentState = await this.snapshotService.captureSnapshot(query.entityType, query.entityId);
            const entityLabel = this.snapshotService.getEntityLabel(query.entityType, query.entityId, currentState);
            const now = Date.now();
            const timeline = logs.map(log => ({
                id: log.id,
                action: log.action,
                summary: log.summary,
                performedByName: log.performedByName,
                performedById: log.performedById,
                createdAt: log.createdAt.toISOString(),
                relativeTime: this.getRelativeTime(now, log.createdAt.getTime()),
                changeCount: log.changeCount,
                fieldChanges: log.fieldChanges.map(fc => ({
                    fieldName: fc.fieldName,
                    fieldLabel: fc.fieldLabel,
                    oldValue: fc.oldValue,
                    newValue: fc.newValue,
                    oldDisplayValue: fc.oldDisplayValue,
                    newDisplayValue: fc.newDisplayValue,
                    fieldType: fc.fieldType,
                })),
                icon: ACTION_ICONS[log.action] || '??',
                color: ACTION_COLORS[log.action] || '#6B7280',
            }));
            return {
                entity: {
                    type: query.entityType,
                    id: query.entityId,
                    label: entityLabel,
                    currentState,
                },
                timeline,
                meta: { page, limit, total },
            };
        }
        catch (error) {
            this.logger.error(`GetEntityTimelineHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    getRelativeTime(now, then) {
        const diff = now - then;
        const mins = Math.floor(diff / 60000);
        if (mins < 1)
            return 'just now';
        if (mins < 60)
            return `${mins} minute${mins > 1 ? 's' : ''} ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30)
            return `${days} day${days > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
};
exports.GetEntityTimelineHandler = GetEntityTimelineHandler;
exports.GetEntityTimelineHandler = GetEntityTimelineHandler = GetEntityTimelineHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_entity_timeline_query_1.GetEntityTimelineQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_snapshot_service_1.AuditSnapshotService])
], GetEntityTimelineHandler);
//# sourceMappingURL=get-entity-timeline.handler.js.map