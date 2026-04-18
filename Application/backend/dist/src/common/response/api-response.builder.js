"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseBuilder = void 0;
class ApiResponseBuilder {
    constructor() {
        this._success = true;
        this._statusCode = 200;
    }
    static success(data) {
        const b = new ApiResponseBuilder();
        b._data = data;
        b._statusCode = 200;
        return b;
    }
    static created(data) {
        const b = new ApiResponseBuilder();
        b._data = data;
        b._statusCode = 201;
        b._message = 'Created successfully';
        return b;
    }
    static noContent() {
        const b = new ApiResponseBuilder();
        b._data = null;
        b._statusCode = 204;
        b._message = 'No content';
        return b;
    }
    static paginated(items, meta) {
        const b = new ApiResponseBuilder();
        b._data = items;
        b._meta = meta;
        b._statusCode = 200;
        return b;
    }
    message(msg) {
        this._message = msg;
        return this;
    }
    statusCode(code) {
        this._statusCode = code;
        return this;
    }
    meta(meta) {
        this._meta = meta;
        return this;
    }
    build() {
        return {
            __isBuilderResult: true,
            success: this._success,
            statusCode: this._statusCode,
            message: this._message,
            data: this._data,
            meta: this._meta,
        };
    }
}
exports.ApiResponseBuilder = ApiResponseBuilder;
//# sourceMappingURL=api-response.builder.js.map