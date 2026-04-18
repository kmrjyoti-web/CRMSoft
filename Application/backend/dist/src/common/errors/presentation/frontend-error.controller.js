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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendErrorController = void 0;
const common_1 = require("@nestjs/common");
const error_logger_service_1 = require("../error-logger.service");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const crypto_1 = require("crypto");
let FrontendErrorController = class FrontendErrorController {
    constructor(errorLoggerService) {
        this.errorLoggerService = errorLoggerService;
    }
    logFrontendError(req, body) {
        const traceId = (0, crypto_1.randomUUID)();
        const tenantId = req.tenantId || req.user?.tenantId || null;
        const userId = req.user?.id || null;
        this.errorLoggerService.log({
            requestId: traceId,
            errorCode: body.errorCode || 'FE_UNKNOWN',
            message: body.message,
            statusCode: 0,
            path: body.url || '/',
            method: 'FRONTEND',
            layer: 'FE',
            severity: 'ERROR',
            userId,
            tenantId,
            userAgent: req.headers?.['user-agent'],
            ip: req.ip || req.headers?.['x-forwarded-for']?.toString(),
            module: body.component || 'frontend',
            metadata: {
                url: body.url,
                component: body.component,
                userAction: body.userAction,
                ...body.metadata,
            },
        });
        return { traceId, success: true };
    }
    logMobileError(req, body) {
        const traceId = (0, crypto_1.randomUUID)();
        this.errorLoggerService.log({
            requestId: traceId,
            errorCode: body.errorCode || 'MOB_UNKNOWN',
            message: body.message,
            statusCode: 0,
            path: body.screen || '/',
            method: 'MOBILE',
            layer: 'MOB',
            severity: 'ERROR',
            userId: req.user?.id,
            tenantId: req.user?.tenantId,
            userAgent: req.headers?.['user-agent'],
            ip: req.ip,
            module: body.screen || 'mobile',
            metadata: {
                screen: body.screen,
                action: body.action,
                deviceInfo: body.deviceInfo,
                ...body.metadata,
            },
        });
        return { traceId, success: true };
    }
};
exports.FrontendErrorController = FrontendErrorController;
__decorate([
    (0, common_1.Post)('frontend'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FrontendErrorController.prototype, "logFrontendError", null);
__decorate([
    (0, common_1.Post)('mobile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FrontendErrorController.prototype, "logMobileError", null);
exports.FrontendErrorController = FrontendErrorController = __decorate([
    (0, common_1.Controller)('errors'),
    __metadata("design:paramtypes", [error_logger_service_1.ErrorLoggerService])
], FrontendErrorController);
//# sourceMappingURL=frontend-error.controller.js.map