import { Prisma } from '@prisma/working-client';

/**
 * Prisma middleware that auto-adds `isDeleted: false` to findMany/findFirst/count
 * queries for soft-deletable models, UNLESS `isDeleted` is explicitly set in the
 * where clause (for recycle-bin queries).
 */

const SOFT_DELETE_MODELS = new Set([
  'Contact',
  'Organization',
  'Lead',
  'Activity',
  'RawContact',
  'User',
]);

export function createSoftDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
      return next(params);
    }

    const filteredActions = ['findFirst', 'findMany', 'count'];

    if (filteredActions.includes(params.action)) {
      // Only auto-filter if isDeleted is not explicitly set in where clause
      if (params.args?.where?.isDeleted === undefined) {
        params.args = params.args || {};
        params.args.where = { ...params.args.where, isDeleted: false };
      }
    }

    return next(params);
  };
}
