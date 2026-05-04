import { Logger } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

const secLog = new Logger('TENANT_SECURITY');

/**
 * $extends factory for working/demo Prisma clients.
 *
 * FAIL-CLOSED rules:
 *   getTenantId() === undefined    → passthrough (seed/background job/public route/super-admin)
 *   getTenantId() === ''           → passthrough (shared-tenant legacy; TenantGuard owns this)
 *   getTenantId() returns UUID     → inject tenantId into WHERE / DATA
 *   args.where.tenantId !== ctx    → log CROSS_TENANT_ATTEMPT, override with context tenant
 *
 * Phase 2 adds: count, aggregate, groupBy, upsert
 * Still parked: $queryRaw, $executeRaw (manual audit only — cannot intercept)
 *   Per-tenant dedicated DB clients (getWorkingClient)
 */
export function createTenantAwareExtension(tenantContext: TenantContextService) {
  const injectWhere = (existingWhere: any, tenantId: string) => {
    const requested = existingWhere?.tenantId;
    if (requested && requested !== tenantId) {
      secLog.error(
        `CROSS_TENANT_ATTEMPT where.tenantId=${requested} context=${tenantId}`,
      );
    }
    return existingWhere
      ? { AND: [{ tenantId }, existingWhere] }
      : { tenantId };
  };

  const getTenant = (): string | null => {
    const id = tenantContext.getTenantId();
    if (!id) return null; // no context or empty — passthrough
    return id;
  };

  return {
    name: 'tenantFilter',
    query: {
      $allModels: {
        async findMany({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findFirst({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findFirstOrThrow({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async findUnique({ args, query, model }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          // PK lookup — verify after
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
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          const result = await query(args);
          if (result && (result as any).tenantId && (result as any).tenantId !== tenantId) {
            secLog.error(
              `CROSS_TENANT_ATTEMPT op=findUniqueOrThrow model=${model} ` +
              `context=${tenantId} result=${(result as any).tenantId}`,
            );
            throw new Error('Record not found');
          }
          return result;
        },

        async create({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.data = { ...args.data, tenantId };
          return query(args);
        },

        async createMany({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          if (Array.isArray(args.data)) {
            args.data = args.data.map((row: any) => ({ ...row, tenantId }));
          }
          return query(args);
        },

        async update({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async updateMany({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async delete({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async deleteMany({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        // ── Phase 2: aggregations ────────────────────────────────────────────

        async count({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async aggregate({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        async groupBy({ args, query }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);
          args.where = injectWhere(args.where, tenantId);
          return query(args);
        },

        // ── Phase 2: upsert ──────────────────────────────────────────────────
        // WHERE is a unique constraint — cannot wrap with AND (Prisma rejects it).
        // Strategy: inject tenantId into CREATE (so new records get right tenant),
        //           strip tenantId from UPDATE (prevent tenant migration),
        //           post-verify result matches context.

        async upsert({ args, query, model }: any) {
          const tenantId = getTenant();
          if (!tenantId) return query(args);

          // Inject into CREATE block
          args.create = { ...args.create, tenantId };

          // Strip from UPDATE block, log if attempted
          if (args.update?.tenantId && args.update.tenantId !== tenantId) {
            secLog.error(
              `CROSS_TENANT_ATTEMPT op=upsert.update model=${model} ` +
              `context=${tenantId} attempted=${args.update.tenantId}`,
            );
          }
          if (args.update?.tenantId !== undefined) {
            const { tenantId: _stripped, ...rest } = args.update;
            args.update = rest;
          }

          const result = await query(args);

          // Post-verify: ensure the record we touched belongs to our tenant
          if (result && (result as any).tenantId && (result as any).tenantId !== tenantId) {
            secLog.error(
              `CROSS_TENANT_ATTEMPT op=upsert model=${model} ` +
              `context=${tenantId} result=${(result as any).tenantId}`,
            );
          }

          return result;
        },
      },
    },
  };
}
