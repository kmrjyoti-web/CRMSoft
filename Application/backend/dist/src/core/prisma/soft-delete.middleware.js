"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSoftDeleteMiddleware = createSoftDeleteMiddleware;
const SOFT_DELETE_MODELS = new Set([
    'Contact',
    'Organization',
    'Lead',
    'Activity',
    'RawContact',
    'User',
]);
function createSoftDeleteMiddleware() {
    return async (params, next) => {
        if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
            return next(params);
        }
        const filteredActions = ['findFirst', 'findMany', 'count'];
        if (filteredActions.includes(params.action)) {
            if (params.args?.where?.isDeleted === undefined) {
                params.args = params.args || {};
                params.args.where = { ...params.args.where, isDeleted: false };
            }
        }
        return next(params);
    };
}
//# sourceMappingURL=soft-delete.middleware.js.map