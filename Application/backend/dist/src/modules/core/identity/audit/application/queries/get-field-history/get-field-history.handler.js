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
var GetFieldHistoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFieldHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_field_history_query_1 = require("./get-field-history.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetFieldHistoryHandler = GetFieldHistoryHandler_1 = class GetFieldHistoryHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetFieldHistoryHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const skip = (page - 1) * limit;
            const [changes, total] = await Promise.all([
                this.prisma.identity.auditFieldChange.findMany({
                    where: {
                        fieldName: query.fieldName,
                        auditLog: { entityType: query.entityType, entityId: query.entityId },
                    },
                    include: {
                        auditLog: { select: { id: true, action: true, performedByName: true, performedById: true, createdAt: true, summary: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.identity.auditFieldChange.count({
                    where: {
                        fieldName: query.fieldName,
                        auditLog: { entityType: query.entityType, entityId: query.entityId },
                    },
                }),
            ]);
            return {
                entityType: query.entityType,
                entityId: query.entityId,
                fieldName: query.fieldName,
                history: changes.map(c => ({
                    id: c.id,
                    auditLogId: c.auditLogId,
                    oldValue: c.oldValue,
                    newValue: c.newValue,
                    oldDisplayValue: c.oldDisplayValue,
                    newDisplayValue: c.newDisplayValue,
                    fieldType: c.fieldType,
                    performedByName: c.auditLog.performedByName,
                    performedById: c.auditLog.performedById,
                    action: c.auditLog.action,
                    createdAt: c.createdAt.toISOString(),
                })),
                meta: { page, limit, total },
            };
        }
        catch (error) {
            this.logger.error(`GetFieldHistoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFieldHistoryHandler = GetFieldHistoryHandler;
exports.GetFieldHistoryHandler = GetFieldHistoryHandler = GetFieldHistoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_field_history_query_1.GetFieldHistoryQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetFieldHistoryHandler);
//# sourceMappingURL=get-field-history.handler.js.map