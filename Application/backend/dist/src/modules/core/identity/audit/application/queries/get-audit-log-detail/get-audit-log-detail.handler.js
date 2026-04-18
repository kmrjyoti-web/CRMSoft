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
var GetAuditLogDetailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuditLogDetailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_audit_log_detail_query_1 = require("./get-audit-log-detail.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetAuditLogDetailHandler = GetAuditLogDetailHandler_1 = class GetAuditLogDetailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetAuditLogDetailHandler_1.name);
    }
    async execute(query) {
        try {
            const log = await this.prisma.identity.auditLog.findUnique({
                where: { id: query.id },
                include: { fieldChanges: { orderBy: { createdAt: 'asc' } } },
            });
            if (!log)
                throw new common_1.NotFoundException('Audit log not found');
            return {
                id: log.id,
                entityType: log.entityType,
                entityId: log.entityId,
                entityLabel: log.entityLabel,
                action: log.action,
                summary: log.summary,
                changeCount: log.changeCount,
                beforeSnapshot: log.beforeSnapshot,
                afterSnapshot: log.afterSnapshot,
                performedById: log.performedById,
                performedByName: log.performedByName,
                performedByEmail: log.performedByEmail,
                performedByRole: log.performedByRole,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                httpMethod: log.httpMethod,
                requestUrl: log.requestUrl,
                source: log.source,
                module: log.module,
                correlationId: log.correlationId,
                tags: log.tags,
                isSensitive: log.isSensitive,
                isSystemAction: log.isSystemAction,
                createdAt: log.createdAt.toISOString(),
                fieldChanges: log.fieldChanges.map(fc => ({
                    id: fc.id,
                    fieldName: fc.fieldName,
                    fieldLabel: fc.fieldLabel,
                    fieldType: fc.fieldType,
                    oldValue: fc.oldValue,
                    newValue: fc.newValue,
                    oldDisplayValue: fc.oldDisplayValue,
                    newDisplayValue: fc.newDisplayValue,
                    isSensitive: fc.isSensitive,
                })),
            };
        }
        catch (error) {
            this.logger.error(`GetAuditLogDetailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAuditLogDetailHandler = GetAuditLogDetailHandler;
exports.GetAuditLogDetailHandler = GetAuditLogDetailHandler = GetAuditLogDetailHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_audit_log_detail_query_1.GetAuditLogDetailQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetAuditLogDetailHandler);
//# sourceMappingURL=get-audit-log-detail.handler.js.map