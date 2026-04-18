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
var GetGlobalFeedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGlobalFeedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_global_feed_query_1 = require("./get-global-feed.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetGlobalFeedHandler = GetGlobalFeedHandler_1 = class GetGlobalFeedHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetGlobalFeedHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.entityType)
                where.entityType = query.entityType;
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
            return {
                feed: logs.map(log => ({
                    id: log.id,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    entityLabel: log.entityLabel,
                    action: log.action,
                    summary: log.summary,
                    changeCount: log.changeCount,
                    performedByName: log.performedByName,
                    performedById: log.performedById,
                    source: log.source,
                    module: log.module,
                    createdAt: log.createdAt.toISOString(),
                    fieldChanges: log.fieldChanges.map(fc => ({
                        fieldName: fc.fieldName,
                        fieldLabel: fc.fieldLabel,
                        oldDisplayValue: fc.oldDisplayValue,
                        newDisplayValue: fc.newDisplayValue,
                    })),
                })),
                meta: { page, limit, total },
            };
        }
        catch (error) {
            this.logger.error(`GetGlobalFeedHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetGlobalFeedHandler = GetGlobalFeedHandler;
exports.GetGlobalFeedHandler = GetGlobalFeedHandler = GetGlobalFeedHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_global_feed_query_1.GetGlobalFeedQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetGlobalFeedHandler);
//# sourceMappingURL=get-global-feed.handler.js.map