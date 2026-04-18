"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMapperInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const result_1 = require("../result");
let ResponseMapperInterceptor = class ResponseMapperInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && data.__isApiResponse) {
                return data;
            }
            if (data instanceof result_1.Result) {
                if (data.isOk) {
                    return {
                        success: true,
                        statusCode: response.statusCode,
                        message: this.getDefaultMessage(request.method),
                        data: data.value ?? null,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                        requestId: request.requestId || 'unknown',
                    };
                }
                const err = data.error;
                response.status(err.httpStatus);
                return {
                    success: false,
                    statusCode: err.httpStatus,
                    message: err.message,
                    error: {
                        code: err.code,
                        message: err.message,
                        details: err.details ?? null,
                        suggestion: err.suggestion,
                        documentationUrl: `/docs/errors#${err.code}`,
                    },
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    requestId: request.requestId || 'unknown',
                };
            }
            if (data && data.__isResultError) {
                response.status(data.httpStatus);
                return {
                    success: false,
                    statusCode: data.httpStatus,
                    message: data.message,
                    error: {
                        code: data.code,
                        message: data.message,
                        details: data.details ?? null,
                        suggestion: data.suggestion,
                        documentationUrl: `/docs/errors#${data.code}`,
                    },
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    requestId: request.requestId || 'unknown',
                };
            }
            if (data && data.__isBuilderResult) {
                const statusCode = data.statusCode ?? response.statusCode;
                response.status(statusCode);
                return {
                    success: data.success ?? true,
                    statusCode,
                    message: data.message ?? this.getDefaultMessage(request.method),
                    data: data.data ?? null,
                    meta: data.meta ?? undefined,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    requestId: request.requestId || 'unknown',
                };
            }
            return {
                success: true,
                statusCode: response.statusCode,
                message: this.getDefaultMessage(request.method),
                data: data ?? null,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.requestId || 'unknown',
            };
        }));
    }
    getDefaultMessage(method) {
        switch (method) {
            case 'GET':
                return 'Data fetched successfully';
            case 'POST':
                return 'Created successfully';
            case 'PUT':
            case 'PATCH':
                return 'Updated successfully';
            case 'DELETE':
                return 'Deleted successfully';
            default:
                return 'Request processed successfully';
        }
    }
};
exports.ResponseMapperInterceptor = ResponseMapperInterceptor;
exports.ResponseMapperInterceptor = ResponseMapperInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseMapperInterceptor);
//# sourceMappingURL=response-mapper.interceptor.js.map