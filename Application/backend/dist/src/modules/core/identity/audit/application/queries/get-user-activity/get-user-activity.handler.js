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
var GetUserActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_user_activity_query_1 = require("./get-user-activity.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetUserActivityHandler = GetUserActivityHandler_1 = class GetUserActivityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetUserActivityHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const skip = (page - 1) * limit;
            const where = { performedById: query.userId };
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
                userId: query.userId,
                activity: logs.map(log => ({
                    id: log.id,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    entityLabel: log.entityLabel,
                    action: log.action,
                    summary: log.summary,
                    changeCount: log.changeCount,
                    module: log.module,
                    createdAt: log.createdAt.toISOString(),
                })),
                meta: { page, limit, total },
            };
        }
        catch (error) {
            this.logger.error(`GetUserActivityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetUserActivityHandler = GetUserActivityHandler;
exports.GetUserActivityHandler = GetUserActivityHandler = GetUserActivityHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_user_activity_query_1.GetUserActivityQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetUserActivityHandler);
//# sourceMappingURL=get-user-activity.handler.js.map