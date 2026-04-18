"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ErrorCaptureInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCaptureInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
let ErrorCaptureInterceptor = ErrorCaptureInterceptor_1 = class ErrorCaptureInterceptor {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(ErrorCaptureInterceptor_1.name);
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        return next.handle().pipe((0, operators_1.catchError)((err) => {
            const status = err?.status ?? err?.statusCode ?? 500;
            if (status >= 500) {
                this.captureError(err, req).catch(() => {
                });
            }
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
    async captureError(err, req) {
        try {
            await this.db.globalErrorLog.create({
                data: {
                    severity: 'HIGH',
                    errorCode: err?.code ?? `HTTP_${err?.status ?? 500}`,
                    message: err?.message ?? 'Unknown error',
                    stackTrace: err?.stack,
                    endpoint: `${req?.method} ${req?.url}`,
                    httpStatus: err?.status ?? 500,
                    userId: req?.user?.id,
                    userAgent: req?.headers?.['user-agent'],
                    ipAddress: req?.ip ?? req?.headers?.['x-forwarded-for'],
                    requestContext: {
                        method: req?.method,
                        url: req?.url,
                        params: req?.params,
                        query: req?.query,
                    },
                },
            });
        }
        catch (captureErr) {
            this.logger.warn(`ErrorCaptureInterceptor: failed to log error: ${captureErr.message}`);
        }
    }
};
exports.ErrorCaptureInterceptor = ErrorCaptureInterceptor;
exports.ErrorCaptureInterceptor = ErrorCaptureInterceptor = ErrorCaptureInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], ErrorCaptureInterceptor);
//# sourceMappingURL=error-capture.interceptor.js.map