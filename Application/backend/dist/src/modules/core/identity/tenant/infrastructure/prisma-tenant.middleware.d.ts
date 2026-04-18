import { Prisma } from '@prisma/identity-client';
import { TenantContextService } from './tenant-context.service';
export declare function createTenantMiddleware(tenantContext: TenantContextService): Prisma.Middleware;
