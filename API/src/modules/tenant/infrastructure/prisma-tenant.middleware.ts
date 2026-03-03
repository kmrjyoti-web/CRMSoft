import { Prisma } from '@prisma/client';
import { TenantContextService } from './tenant-context.service';

// Models that exist outside tenant boundaries — skip all injection
const GLOBAL_MODELS = new Set([
  'Tenant',
  'Plan',
  'Subscription',
  'TenantInvoice',
  'TenantUsage',
  'SuperAdmin',
  'Permission',
  'GlobalDefaultCredential',
]);

export function createTenantMiddleware(
  tenantContext: TenantContextService,
): Prisma.Middleware {
  return async (params, next) => {
    // Skip global models
    if (params.model && GLOBAL_MODELS.has(params.model)) {
      return next(params);
    }

    const tenantId = tenantContext.getTenantId();

    // No tenant context (seed scripts, public routes, super admin) — passthrough
    if (!tenantId) {
      return next(params);
    }

    switch (params.action) {
      case 'create':
        params.args.data = { ...params.args.data, tenantId };
        break;

      case 'createMany':
        if (params.args.data && Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item: any) => ({
            ...item,
            tenantId,
          }));
        }
        break;

      case 'upsert':
        params.args.where = { ...params.args.where, tenantId };
        params.args.create = { ...params.args.create, tenantId };
        break;

      case 'findUnique':
        // Convert to findFirst + add tenantId (compound unique keys break old shapes)
        params.action = 'findFirst' as any;
        params.args = {
          where: { ...params.args.where, tenantId },
          ...(params.args.select && { select: params.args.select }),
          ...(params.args.include && { include: params.args.include }),
        };
        break;

      case 'findFirst':
      case 'findMany':
      case 'count':
      case 'aggregate':
      case 'groupBy':
        params.args = params.args || {};
        params.args.where = { ...params.args.where, tenantId };
        break;

      case 'update':
      case 'delete':
        params.args.where = { ...params.args.where, tenantId };
        break;

      case 'updateMany':
      case 'deleteMany':
        params.args = params.args || {};
        params.args.where = { ...params.args.where, tenantId };
        break;
    }

    return next(params);
  };
}
