import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';
export declare class TenantContextInterceptor implements NestInterceptor {
    private readonly tenantContext;
    constructor(tenantContext: TenantContextService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
