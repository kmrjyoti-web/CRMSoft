import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantAuditService } from '../services/tenant-audit.service';

@Injectable()
export class TenantAuditMiddleware implements NestMiddleware {
  constructor(private readonly auditService: TenantAuditService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId =
      (req as any).user?.tenantId || (req.headers['x-tenant-id'] as string);
    if (!tenantId) return next();

    const activeAudit = this.auditService.getActiveAudit(tenantId);
    if (!activeAudit) return next();

    const startTime = Date.now();

    res.on('finish', () => {
      // Fire-and-forget: log the activity asynchronously
      setImmediate(async () => {
        try {
          const user = (req as any).user;
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
            description: this.buildDescription(
              req.method,
              req.url,
              entityInfo,
              res.statusCode,
            ),
            metadata:
              req.method !== 'GET'
                ? {
                    requestBody: this.redactBody(req.body),
                    responseStatus: res.statusCode,
                  }
                : { responseStatus: res.statusCode },
            pageUrl: req.headers.referer as string,
            durationMs: Date.now() - startTime,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            deviceType: this.detectDevice(req.headers['user-agent']),
          });
        } catch {
