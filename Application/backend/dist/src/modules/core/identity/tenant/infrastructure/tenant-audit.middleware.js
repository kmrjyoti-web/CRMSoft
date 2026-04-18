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
exports.TenantAuditMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_audit_service_1 = require("../services/tenant-audit.service");
let TenantAuditMiddleware = class TenantAuditMiddleware {
    constructor(auditService) {
        this.auditService = auditService;
    }
    use(req, res, next) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId)
            return next();
        const activeAudit = this.auditService.getActiveAudit(tenantId);
        if (!activeAudit)
            return next();
        const startTime = Date.now();
        res.on('finish', () => {
            setImmediate(async () => {
                try {
                    const user = req.user;
                    const actionType = this.classifyAction(req.method, req.url);
                    const entityInfo = this.extractEntity(req.url);
                    await this.auditService.logActivity({
                        sessionId: activeAudit.id,
                        tenantId,
                        userId: user?.id || 'anonymous',
                        userName: user?.name,
                        userRole: user?.role || user?.roleName,
                        actionType,
                        entityType: entityInfo?.type,
                        entityId: entityInfo?.id,
                        description: this.buildDescription(req.method, req.url, entityInfo, res.statusCode),
                        metadata: req.method !== 'GET'
                            ? {
                                requestBody: this.redactBody(req.body),
                                responseStatus: res.statusCode,
                            }
                            : { responseStatus: res.statusCode },
                        pageUrl: req.headers.referer,
                        durationMs: Date.now() - startTime,
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent'],
                        deviceType: this.detectDevice(req.headers['user-agent']),
                    });
                }
                catch {
                }
            });
        });
        next();
    }
    classifyAction(method, url) {
        if (url.includes('/auth/login'))
            return 'LOGIN';
        if (url.includes('/auth/logout'))
            return 'LOGOUT';
        if (url.includes('/export'))
            return 'EXPORT';
        if (url.includes('/import'))
            return 'IMPORT';
        if (url.includes('/settings') && method !== 'GET')
            return 'SETTINGS_CHANGE';
        if (url.includes('/search'))
            return 'SEARCH';
        if (url.includes('/bulk'))
            return 'BULK_ACTION';
        if (url.includes('/upload'))
            return 'FILE_UPLOAD';
        if (url.includes('/download'))
            return 'FILE_DOWNLOAD';
        switch (method) {
            case 'POST':
                return 'CREATE';
            case 'PUT':
            case 'PATCH':
                return 'UPDATE';
            case 'DELETE':
                return 'DELETE';
            default:
                return 'API_CALL';
        }
    }
    extractEntity(url) {
        const match = url.match(/\/api\/v\d+\/([a-z-]+)(?:\/([a-f0-9-]+))?/);
        if (!match)
            return null;
        return { type: match[1], id: match[2] };
    }
    buildDescription(method, url, entity, statusCode) {
        const action = method === 'POST'
            ? 'Created'
            : method === 'PUT' || method === 'PATCH'
                ? 'Updated'
                : method === 'DELETE'
                    ? 'Deleted'
                    : 'Accessed';
        const target = entity?.type || 'resource';
        const id = entity?.id ? ` (${entity.id.slice(0, 8)})` : '';
        const status = statusCode >= 400 ? ` [${statusCode}]` : '';
        return `${action} ${target}${id}${status}`;
    }
    redactBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const redacted = { ...body };
        const sensitive = [
            'password',
            'token',
            'secret',
            'creditCard',
            'cvv',
            'otp',
        ];
        for (const field of sensitive) {
            if (redacted[field])
                redacted[field] = '[REDACTED]';
        }
        return redacted;
    }
    detectDevice(userAgent) {
        if (!userAgent)
            return 'unknown';
        if (/mobile/i.test(userAgent))
            return 'mobile';
        if (/tablet|ipad/i.test(userAgent))
            return 'tablet';
        return 'desktop';
    }
};
exports.TenantAuditMiddleware = TenantAuditMiddleware;
exports.TenantAuditMiddleware = TenantAuditMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_audit_service_1.TenantAuditService])
], TenantAuditMiddleware);
//# sourceMappingURL=tenant-audit.middleware.js.map