"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenantMiddleware = createTenantMiddleware;
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
function createTenantMiddleware(tenantContext) {
    return async (params, next) => {
        if (params.model && GLOBAL_MODELS.has(params.model)) {
            return next(params);
        }
        const tenantId = tenantContext.getTenantId();
        if (!tenantId) {
            return next(params);
        }
        switch (params.action) {
            case 'create':
                params.args.data = { ...params.args.data, tenantId };
                break;
            case 'createMany':
                if (params.args.data && Array.isArray(params.args.data)) {
                    params.args.data = params.args.data.map((item) => ({
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
                params.action = 'findFirst';
                params.args = {
                    where: { ...params.args.where, tenantId },
                    ...(params.args.select && { select: params.args.select }),
                    ...(params.args.include && { include: params.args.include }),
                };
                break;
            case 'findUniqueOrThrow':
                params.action = 'findFirstOrThrow';
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
//# sourceMappingURL=prisma-tenant.middleware.js.map