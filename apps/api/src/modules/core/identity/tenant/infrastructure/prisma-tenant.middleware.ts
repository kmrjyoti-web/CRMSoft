import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/identity-client';
import { TenantContextService } from './tenant-context.service';

const logger = new Logger('TenantMiddleware');

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
  'PageRegistry',
  'BusinessTypeRegistry',
  'MarketplaceVendor',
  'AppVersion',
  'IndustryPatch',
  'TenantVersion',
  'VersionBackup',
]);

/** Detect and log when a caller explicitly passes a different tenantId in the where clause */
function detectCrossTenantAttempt(
  params: { model?: string; action: string; args?: any },
  contextTenantId: string,
) {
  const requestedTenantId = params.args?.where?.tenantId ?? params.args?.data?.tenantId;
  if (requestedTenantId && requestedTenantId !== contextTenantId) {
    logger.error(
      `CROSS_TENANT_ATTEMPT model=${params.model} action=${params.action} ` +
      `context=${contextTenantId} requested=${requestedTenantId}`,
    );
  }
}

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

    detectCrossTenantAttempt(params, tenantId);

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

      case 'findUniqueOrThrow':
        // Convert to findFirstOrThrow + add tenantId
        params.action = 'findFirstOrThrow' as any;
        params.args = {
          where: { ...params.args.where, tenantId },
          ...(params.args.select && { select: params.args.select }),
          ...(params.args.include && { include: params.args.include }),
        };
        break;

      case 'findFirst':
      case 'findFirstOrThrow':
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
