import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditCoreService } from '../services/audit-core.service';
import { AuditSnapshotService } from '../services/audit-snapshot.service';
import { AuditEntityResolverService } from '../services/audit-entity-resolver.service';
import { TenantContextService } from '../../../modules/tenant/infrastructure/tenant-context.service';
import { AUDIT_SKIP_KEY } from '../decorators/audit-skip.decorator';
import { AUDIT_META_KEY } from '../decorators/auditable.decorator';
import { AUDIT_ENTITY_KEY } from '../decorators/audit-entity.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(
    private readonly auditCoreService: AuditCoreService,
    private readonly snapshotService: AuditSnapshotService,
    private readonly entityResolver: AuditEntityResolverService,
    private readonly tenantContext: TenantContextService,
    private readonly reflector: Reflector,
  ) {
    this.logger.log('AuditInterceptor initialized');
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (!request) return next.handle();

    const method = request.method;

    // Skip non-mutating methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    // Check @AuditSkip()
    const handler = context.getHandler();
    const controller = context.getClass();
    const skipAudit = this.reflector.getAllAndOverride<boolean>(AUDIT_SKIP_KEY, [handler, controller]);
    if (skipAudit) {
      return next.handle();
    }

    // Resolve entity from URL
    const resolved = this.entityResolver.resolve(request.url, request.params || {}, method);
    this.logger.debug(`[AUDIT] ${method} ${request.url} → resolved=${JSON.stringify(resolved)}`);

    // Check @AuditEntity() on controller
    const controllerEntityType = this.reflector.get<string>(AUDIT_ENTITY_KEY, controller);
    if (resolved && controllerEntityType) {
      resolved.entityType = controllerEntityType;
    }

    // Check @Auditable() on handler
    const auditMeta: any = this.reflector.get(AUDIT_META_KEY, handler) || null;
    if (resolved && auditMeta) {
      if (auditMeta.entityType) resolved.entityType = auditMeta.entityType;
      if (auditMeta.action) resolved.action = auditMeta.action;
      if (auditMeta.module) resolved.module = auditMeta.module;
    }

    if (!resolved) {
      this.logger.debug(`[AUDIT] No route match for ${method} ${request.url} — skipping`);
      return next.handle();
    }

    // Capture BEFORE state for UPDATE/DELETE
    let beforeSnapshot: any = null;
    if (['UPDATE', 'DELETE', 'SOFT_DELETE', 'STATUS_CHANGE'].includes(resolved.action) && resolved.entityId) {
      try {
        beforeSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, resolved.entityId);
      } catch {
        // Don't block the request
      }
    }

    // Capture tenantId synchronously (ALS context lost after setImmediate)
    const tenantId = this.tenantContext.getTenantId() || request.user?.tenantId || '';

    // Capture request context
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

    return next.handle().pipe(
      tap(async (responseData) => {
        // Async, non-blocking audit logging
        setImmediate(async () => {
          try {
            let afterSnapshot: any = null;
            const customSummary = auditMeta?.summary || undefined;

            if (resolved.action === 'CREATE') {
              const createdId = this.extractEntityId(responseData);
              if (createdId) {
                resolved.entityId = createdId;
                afterSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, createdId);
              } else {
                afterSnapshot = this.extractEntityFromResponse(responseData);
              }
            } else if (['UPDATE', 'STATUS_CHANGE'].includes(resolved.action) && resolved.entityId) {
              afterSnapshot = await this.snapshotService.captureSnapshot(resolved.entityType, resolved.entityId);
            }

            if (!resolved.entityId) {
              this.logger.warn(`[AUDIT] No entityId for ${resolved.entityType} ${resolved.action} — skipping log`);
              return;
            }

            this.logger.log(`[AUDIT] Logging: ${resolved.action} ${resolved.entityType} ${resolved.entityId} tenant=${tenantId}`);
            await this.auditCoreService.log({
              tenantId,
              entityType: resolved.entityType,
              entityId: resolved.entityId,
              action: resolved.action,
              beforeSnapshot,
              afterSnapshot,
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
          } catch (error) {
            // NEVER let audit logging break the application
            this.logger.error(`[AUDIT] Audit log error: ${error.message}`, error.stack);
          }
        });
      }),
      catchError((error) => {
        throw error;
      }),
    );
  }

  private extractEntityId(response: any): string | null {
    return response?.data?.id || response?.id || response?.data?.data?.id || null;
  }

  private extractEntityFromResponse(response: any): any {
    return response?.data || response?.data?.data || response || null;
  }
}
