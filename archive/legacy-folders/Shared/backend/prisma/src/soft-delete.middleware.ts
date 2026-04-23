/**
 * Prisma middleware that auto-adds `isDeleted: false` to read queries.
 * Pass the set of model names to filter.
 */
export function createSoftDeleteMiddleware(models: Set<string>) {
  return async (params: any, next: any) => {
    if (!params.model || !models.has(params.model)) return next(params);
    if (['findFirst', 'findMany', 'count'].includes(params.action)) {
      if (params.args?.where?.isDeleted === undefined) {
        params.args = params.args || {};
        params.args.where = { ...params.args.where, isDeleted: false };
      }
    }
    return next(params);
  };
}

/** Default soft-deletable model names used in CRMSoft working DB */
export const DEFAULT_SOFT_DELETE_MODELS = new Set([
  'Contact', 'Organization', 'Lead', 'Activity', 'RawContact', 'User',
]);
