import { Logger } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

const secLog = new Logger('TENANT_SECURITY');

/**
 * FAIL-CLOSED rules (applied on every query to working/demo clients):
 *
 *   No ALS context at all (seed/background job) → passthrough (trust caller)
 *   Context.isPublic === true                   → passthrough
 *   Context present, tenantId empty             → THROW + log TENANT_LEAK_BLOCKED
 *   tenantId in args !== context tenantId       → log CROSS_TENANT_ATTEMPT, override
 *   Normal authenticated request                → inject tenantId into WHERE/DATA
 *
 * Parked for Kumar morning:
 *   - count, aggregate, groupBy
 *   - upsert
 *   - $queryRaw / $executeRaw
 *   - $transaction batches
 *   - per-tenant dedicated DB clients (getWorkingClient)
 */
export function createTenantAwareExtension(tenantContext: TenantContextService) {
  const injectWhere = (existingWhere: any, tenantId: string) => {
    // Detect cross-tenant attempt before overwriting
    if (existingWhere?.tenantId && existingWhere.tenantId !== tenantId) {
      secLog.error(
        `CROSS_TENANT_ATTEMPT requested=${existingWhere.tenantId} context=${tenantId}`,
      );
    }
    return existingWhere
      ? { AND: [{ tenantId }, existingWhere] }
      : { tenantId };
  };

  const requireTenant = (model: string, op: string): string => {
    const ctx = tenantContext.getContext();

    // No ALS context at all (seed scripts, background jobs, admin tools)
    if (!ctx) return '';

    // Explicitly public request
    if (ctx.isPublic) return '';

    // Context set but no tenantId — hard fail
    if (!ctx.tenantId) {
      secLog.error(`TENANT_LEAK_BLOCKED op=${op} model=${model} reason=no_tenantId`);
      throw new Error(`TENANT_REQUIRED: ${model}.${op} — no tenantId in authenticated context`);
    }

    return ctx.tenantId;
  };

  return {
    name: 'tenantFilter',
    query: {
      $allModels: {
        async findMany({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'findMany');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findFirst({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'findFirst');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findFirstOrThrow({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'findFirstOrThrow');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findUnique({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'findUnique');
          if (!tenantId) return query(args);

          // findUnique uses PK — post-query verify
          const result = await query(args);
          if (result && (result as any).tenantId && (result as any).tenantId !== tenantId) {
            secLog.error(
              `CROSS_TENANT_ATTEMPT op=findUnique model=${model} ` +
              `context=${tenantId} result=${(result as any).tenantId}`,
            );
            return null;
          }
          return result;
        },

        async findUniqueOrThrow({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'findUniqueOrThrow');
          if (!tenantId) return query(args);
          const result = await query(args);
          if (result && (result as any).tenantId && (result as any).tenantId !== tenantId) {
            secLog.error(
              `CROSS_TENANT_ATTEMPT op=findUniqueOrThrow model=${model} ` +
              `context=${tenantId} result=${(result as any).tenantId}`,
            );
            throw new Error(`Record not found`);
          }
          return result;
        },

        async create({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'create');
          if (!tenantId) return query(args);
          args.data = { ...args.data, tenantId };
          return query(args);
        },

        async createMany({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'createMany');
          if (!tenantId) return query(args);
          if (Array.isArray(args.data)) {
            args.data = args.data.map((row: any) => ({ ...row, tenantId }));
          }
          return query(args);
        },

        async update({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'update');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async updateMany({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'updateMany');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async delete({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'delete');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async deleteMany({ args, query, model }: any) {
          const tenantId = requireTenant(model, 'deleteMany');
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        // PARKED: count, aggregate, groupBy, upsert — Kumar morning Phase 2
      },
    },
  };
}
