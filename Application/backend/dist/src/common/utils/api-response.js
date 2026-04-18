"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor() {
        Object.defineProperty(this, '__isApiResponse', { value: true, enumerable: false });
    }
    static success(data, message = 'Success', meta) {
        const r = new ApiResponse();
        r.success = true;
        r.message = message;
        r.data = data;
        if (meta)
            r.meta = meta;
        return r;
    }
    static error(message) {
        const r = new ApiResponse();
        r.success = false;
        r.message = message;
        return r;
    }
    static paginated(data, total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        return ApiResponse.success(data, 'Success', {
            total, page, limit, totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
        });
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map