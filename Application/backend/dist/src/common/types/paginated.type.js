"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = exports.buildPaginationParams = exports.buildPaginatedResult = void 0;
var paginated_list_helper_1 = require("../utils/paginated-list.helper");
Object.defineProperty(exports, "buildPaginatedResult", { enumerable: true, get: function () { return paginated_list_helper_1.buildPaginatedResult; } });
Object.defineProperty(exports, "buildPaginationParams", { enumerable: true, get: function () { return paginated_list_helper_1.buildPaginationParams; } });
const paginate = (data, total, page, limit) => ({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
});
exports.paginate = paginate;
//# sourceMappingURL=paginated.type.js.map