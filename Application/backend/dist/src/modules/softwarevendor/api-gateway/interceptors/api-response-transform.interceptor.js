"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseTransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ApiResponseTransformInterceptor = class ApiResponseTransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (!request.apiKey)
            return next.handle();
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && data.__isApiResponse)
                return data;
            const apiVersion = request.apiVersion || 'v1';
            if (data && data.data && data.total !== undefined) {
                return {
                    object: 'list',
                    data: data.data,
                    pagination: {
                        total: data.total,
                        page: data.page,
                        limit: data.limit,
                        totalPages: data.totalPages,
                        hasMore: data.page < data.totalPages,
                    },
                    apiVersion,
                    requestId: request.requestId,
                };
            }
            return {
                object: data && Array.isArray(data) ? 'list' : 'object',
                data: data,
                apiVersion,
                requestId: request.requestId,
            };
        }));
    }
};
exports.ApiResponseTransformInterceptor = ApiResponseTransformInterceptor;
exports.ApiResponseTransformInterceptor = ApiResponseTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], ApiResponseTransformInterceptor);
//# sourceMappingURL=api-response-transform.interceptor.js.map