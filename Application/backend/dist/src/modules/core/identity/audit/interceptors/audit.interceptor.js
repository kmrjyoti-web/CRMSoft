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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_core_service_1 = require("../services/audit-core.service");
const audit_snapshot_service_1 = require("../services/audit-snapshot.service");
const audit_entity_resolver_service_1 = require("../services/audit-entity-resolver.service");
const tenant_context_service_1 = require("../../../../../modules/core/identity/tenant/infrastructure/tenant-context.service");
const audit_skip_decorator_1 = require("../decorators/audit-skip.decorator");
const auditable_decorator_1 = require("../decorators/auditable.decorator");
const audit_entity_decorator_1 = require("../decorators/audit-entity.decorator");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let AuditInterceptor = class AuditInterceptor {
    constructor(auditCoreService, snapshotService, entityResolver, tenantContext, reflector) {
        this.auditCoreService = auditCoreService;
        this.snapshotService = snapshotService;
        this.entityResolver = entityResolver;
        this.tenantContext = tenantContext;
        this.reflector = reflector;
        this.logger = new common_1.Logger('AuditInterceptor');
        this.logger.log('AuditInterceptor initialized');
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (!request)
            return next.handle();
        const method = request.method;
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return next.handle();
        }
        const handler = context.getHandler();
        const controller = context.getClass();
        const skipAudit = this.reflector.getAllAndOverride(audit_skip_decorator_1.AUDIT_SKIP_KEY, [handler, controller]);
        if (skipAudit) {
            return next.handle();
        }
        const resolved = this.entityResolver.resolve(request.url, request.params || {}, method);
        this.logger.debug(`[AUDIT] ${method} ${request.url} ? resolved=${JSON.stringify(resolved)}`);
        const controllerEntityType = this.reflector.get(audit_entity_decorator_1.AUDIT_ENTITY_KEY, controller);
        if (resolved && controllerEntityType) {
            resolved.entityType = controllerEntityType;
        }
        const auditMeta = this.reflector.get(auditable_decorator_1.AUDIT_META_KEY, handler) || null;
        if (resolved && auditMeta) {
            if (auditMeta.entityType)
                resolved.entityType = auditMeta.entityType;
            if (auditMeta.action)
                resolved.action = auditMeta.action;
            if (auditMeta.module)
                resolved.module = auditMeta.module;
        }
        if (!resolved) {
            this.logger.debug(`[AUDIT] No route match for ${method} ${request.url} � skipping`);
            return next.handle();
        }
        let beforeSnapshot = null;
        if (['UPDATE', 'DELETE', 'SOFT_DELETE', 'STATUS_CHANGE'].includes(resolved.action) && resolved.entityId) {
            try {
                beforeSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, resolved.entityId);
            }
            catch {
            }
        }
        const tenantId = this.tenantContext.getTenantId() || request.user?.tenantId || '';
        const requestContext = {
            ipAddress: request.ip || request.headers?.['x-forwarded-for'] || null,
            userAgent: request.headers?.['user-agent'] || null,
            httpMethod: method,
            requestUrl: request.url,
            requestBody: request.body,
            userId: request.user?.id,
            userName: request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : null,
            userEmail: request.user?.email,
            userRole: request.user?.role?.name,
        };
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)(async (responseData) => {
            setImmediate(async () => {
                try {
                    let afterSnapshot = null;
                    const customSummary = auditMeta?.summary || undefined;
                    if (resolved.action === 'CREATE') {
                        const createdId = this.extractEntityId(responseData);
                        if (createdId) {
                            resolved.entityId = createdId;
                            afterSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, createdId);
                        }
                        else {
                            afterSnapshot = this.extractEntityFromResponse(responseData);
                        }
                    }
                    else if (['UPDATE', 'STATUS_CHANGE'].includes(resolved.action) && resolved.entityId) {
                        afterSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, resolved.entityId);
                    }
                    if (!resolved.entityId) {
                        this.logger.warn(`[AUDIT] No entityId for ${resolved.entityType} ${resolved.action} � skipping log`);
                        return;
                    }
                    this.logger.log(`[AUDIT] Logging: ${resolved.action} ${resolved.entityType} ${resolved.entityId} tenant=${tenantId}`);
                    await this.auditCoreService.log({
                        tenantId,
                        entityType: resolved.entityType,
                        entityId: resolved.entityId,
                        action: resolved.action,
                        beforeSnapshot: beforeSnapshot ?? undefined,
                        afterSnapshot: afterSnapshot ?? undefined,
                        performedById: requestContext.userId,
                        performedByName: requestContext.userName || undefined,
                        performedByEmail: requestContext.userEmail,
                        performedByRole: requestContext.userRole,
                        ipAddress: requestContext.ipAddress,
                        userAgent: requestContext.userAgent,
                        httpMethod: requestContext.httpMethod,
                        requestUrl: requestContext.requestUrl,
                        requestBody: requestContext.requestBody,
                        source: 'API',
                        module: resolved.module,
                        summary: customSummary,
                    });
                }
                catch (error) {
                    this.logger.error(`[AUDIT] Audit log error: ${(0, error_utils_1.getErrorMessage)(error)}`, error.stack);
                }
            });
        }), (0, operators_1.catchError)((error) => {
            throw error;
        }));
    }
    extractEntityId(response) {
        const data = response?.data;
        return data?.id || response?.id || data?.data?.id || null;
    }
    extractEntityFromResponse(response) {
        const data = response?.data;
        return data?.data || data || response || null;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_core_service_1.AuditCoreService,
        audit_snapshot_service_1.AuditSnapshotService,
        audit_entity_resolver_service_1.AuditEntityResolverService,
        tenant_context_service_1.TenantContextService,
        core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map