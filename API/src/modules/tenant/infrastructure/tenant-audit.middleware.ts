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
          // Silently ignore audit failures — never crash the request pipeline
        }
      });
    });

    next();
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */

  private classifyAction(method: string, url: string): string {
    if (url.includes('/auth/login')) return 'LOGIN';
    if (url.includes('/auth/logout')) return 'LOGOUT';
    if (url.includes('/export')) return 'EXPORT';
    if (url.includes('/import')) return 'IMPORT';
    if (url.includes('/settings') && method !== 'GET') return 'SETTINGS_CHANGE';
    if (url.includes('/search')) return 'SEARCH';
    if (url.includes('/bulk')) return 'BULK_ACTION';
    if (url.includes('/upload')) return 'FILE_UPLOAD';
    if (url.includes('/download')) return 'FILE_DOWNLOAD';

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

  private extractEntity(url: string): { type: string; id?: string } | null {
    // Pattern: /api/v1/{entity}/{id}
    const match = url.match(/\/api\/v\d+\/([a-z-]+)(?:\/([a-f0-9-]+))?/);
    if (!match) return null;
    return { type: match[1], id: match[2] };
  }

  private buildDescription(
    method: string,
    url: string,
    entity: { type?: string; id?: string } | null,
    statusCode: number,
  ): string {
    const action =
      method === 'POST'
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

  private redactBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
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
      if (redacted[field]) redacted[field] = '[REDACTED]';
    }
    return redacted;
  }

  private detectDevice(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }
}
