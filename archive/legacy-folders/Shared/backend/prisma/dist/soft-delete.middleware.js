"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SOFT_DELETE_MODELS = void 0;
exports.createSoftDeleteMiddleware = createSoftDeleteMiddleware;
/**
 * Prisma middleware that auto-adds `isDeleted: false` to read queries.
 * Pass the set of model names to filter.
 */
function createSoftDeleteMiddleware(models) {
    return async (params, next) => {
        if (!params.model || !models.has(params.model))
            return next(params);
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
exports.DEFAULT_SOFT_DELETE_MODELS = new Set([
    'Contact', 'Organization', 'Lead', 'Activity', 'RawContact', 'User',
]);
//# sourceMappingURL=soft-delete.middleware.js.map