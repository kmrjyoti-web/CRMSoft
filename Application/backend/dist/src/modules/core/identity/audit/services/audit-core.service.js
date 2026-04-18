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
var AuditCoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditCoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const audit_diff_service_1 = require("./audit-diff.service");
const audit_snapshot_service_1 = require("./audit-snapshot.service");
const audit_summary_generator_service_1 = require("./audit-summary-generator.service");
const audit_sanitizer_service_1 = require("./audit-sanitizer.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let AuditCoreService = AuditCoreService_1 = class AuditCoreService {
    constructor(prisma, diffService, snapshotService, summaryGenerator, sanitizer) {
        this.prisma = prisma;
        this.diffService = diffService;
        this.snapshotService = snapshotService;
        this.summaryGenerator = summaryGenerator;
        this.sanitizer = sanitizer;
        this.logger = new common_1.Logger(AuditCoreService_1.name);
    }
    async log(params) {
        try {
            if (!params.entityId)
                return null;
            const sanitizedBody = params.requestBody ? this.sanitizer.sanitize(params.requestBody) : null;
            const sanitizedBefore = params.beforeSnapshot ? this.sanitizer.sanitizeSnapshot(params.beforeSnapshot, params.entityType) : null;
            const sanitizedAfter = params.afterSnapshot ? this.sanitizer.sanitizeSnapshot(params.afterSnapshot, params.entityType) : null;
            const fieldChanges = this.diffService.computeDiff(sanitizedBefore, sanitizedAfter, params.entityType);
            const entityLabel = this.snapshotService.getEntityLabel(params.entityType, params.entityId, (sanitizedAfter || sanitizedBefore) ?? undefined);
            const summary = params.summary || this.summaryGenerator.generateSummary({
                action: params.action,
                entityType: params.entityType,
                entityLabel,
                performedByName: params.performedByName || 'System',
                fieldChanges,
            });
            const isSensitive = fieldChanges.some(fc => fc.isSensitive);
            const isSystemAction = params.source === 'CRON' || params.source === 'WORKFLOW' || params.source === 'SYSTEM';
            const auditLog = await this.prisma.identity.auditLog.create({
                data: {
                    tenantId: params.tenantId || '',
                    entityType: params.entityType,
                    entityId: params.entityId,
                    entityLabel,
                    action: params.action,
                    summary,
                    changeCount: fieldChanges.length,
                    beforeSnapshot: sanitizedBefore || undefined,
                    afterSnapshot: sanitizedAfter || undefined,
                    performedById: params.performedById,
                    performedByName: params.performedByName,
                    performedByEmail: params.performedByEmail,
                    performedByRole: params.performedByRole,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent ? params.userAgent.substring(0, 500) : null,
                    httpMethod: params.httpMethod,
                    requestUrl: params.requestUrl,
                    requestBody: sanitizedBody || undefined,
                    source: params.source,
                    module: params.module,
                    correlationId: params.correlationId,
                    tags: params.tags || [],
                    isSensitive,
                    isSystemAction,
                    fieldChanges: fieldChanges.length > 0 ? {
                        createMany: {
                            data: fieldChanges.map(fc => ({
                                fieldName: fc.fieldName,
                                fieldLabel: fc.fieldLabel,
                                fieldType: fc.fieldType,
                                oldValue: fc.isSensitive ? '[REDACTED]' : fc.oldValue,
                                newValue: fc.isSensitive ? '[REDACTED]' : fc.newValue,
                                oldDisplayValue: fc.isSensitive ? '[REDACTED]' : fc.oldDisplayValue,
                                newDisplayValue: fc.isSensitive ? '[REDACTED]' : fc.newDisplayValue,
                                isSensitive: fc.isSensitive,
                            })),
                        },
                    } : undefined,
                },
            });
            return auditLog;
        }
        catch (error) {
            this.logger.error(`Audit log failed: ${(0, error_utils_1.getErrorMessage)(error)}`, error.stack);
            return null;
        }
    }
    async logAction(params) {
        try {
            const fieldChanges = (params.changes || []).map(c => ({
                fieldName: c.field,
                fieldLabel: c.field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
                fieldType: 'STRING',
                oldValue: c.oldValue || null,
                newValue: c.newValue || null,
                oldDisplayValue: c.oldValue || '—',
                newDisplayValue: c.newValue || '—',
                isSensitive: this.sanitizer.isSensitive(c.field),
            }));
            const auditLog = await this.prisma.identity.auditLog.create({
                data: {
                    entityType: params.entityType,
                    entityId: params.entityId,
                    entityLabel: `${params.entityType} ${params.entityId.substring(0, 8)}`,
                    action: params.action,
                    summary: params.summary,
                    changeCount: fieldChanges.length,
                    performedById: params.performedById,
                    performedByName: params.performedByName || 'System',
                    source: params.source,
                    module: params.module,
                    correlationId: params.correlationId,
                    tags: params.tags || [],
                    isSystemAction: params.source !== 'API',
                    fieldChanges: fieldChanges.length > 0 ? {
                        createMany: { data: fieldChanges },
                    } : undefined,
                },
            });
            return auditLog;
        }
        catch (error) {
            this.logger.error(`Audit logAction failed: ${(0, error_utils_1.getErrorMessage)(error)}`);
            return null;
        }
    }
};
exports.AuditCoreService = AuditCoreService;
exports.AuditCoreService = AuditCoreService = AuditCoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_diff_service_1.AuditDiffService,
        audit_snapshot_service_1.AuditSnapshotService,
        audit_summary_generator_service_1.AuditSummaryGeneratorService,
        audit_sanitizer_service_1.AuditSanitizerService])
], AuditCoreService);
//# sourceMappingURL=audit-core.service.js.map