"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationParams = buildPaginationParams;
exports.buildPaginatedResult = buildPaginatedResult;
function buildPaginationParams(query) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(Math.max(1, query.limit ?? 20), 100);
    const skip = (page - 1) * limit;
    const orderBy = query.sortBy
        ? { [query.sortBy]: query.sortOrder ?? 'desc' }
        : { createdAt: 'desc' };
    return { page, limit, skip, orderBy };
}
function buildPaginatedResult(data, total, page, limit) {
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    };
}
//# sourceMappingURL=paginated-list.helper.js.map