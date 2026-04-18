import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditCoreService } from '../services/audit-core.service';
import { AuditSnapshotService } from '../services/audit-snapshot.service';
import { AuditEntityResolverService } from '../services/audit-entity-resolver.service';
import { TenantContextService } from '../../../../../modules/core/identity/tenant/infrastructure/tenant-context.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditCoreService;
    private readonly snapshotService;
    private readonly entityResolver;
    private readonly tenantContext;
    private readonly reflector;
    private readonly logger;
    constructor(auditCoreService: AuditCoreService, snapshotService: AuditSnapshotService, entityResolver: AuditEntityResolverService, tenantContext: TenantContextService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>>;
    private extractEntityId;
    private extractEntityFromResponse;
}
