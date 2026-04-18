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
exports.ApiLogAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_logger_service_1 = require("../services/api-logger.service");
const api_log_dto_1 = require("./dto/api-log.dto");
let ApiLogAdminController = class ApiLogAdminController {
    constructor(apiLogger) {
        this.apiLogger = apiLogger;
    }
    async listLogs(req, query) {
        return this.apiLogger.listLogs(req.user.tenantId, query);
    }
};
exports.ApiLogAdminController = ApiLogAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, api_log_dto_1.ApiLogQueryDto]),
    __metadata("design:returntype", Promise)
], ApiLogAdminController.prototype, "listLogs", null);
exports.ApiLogAdminController = ApiLogAdminController = __decorate([
    (0, common_1.Controller)('api-gateway/admin/logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [api_logger_service_1.ApiLoggerService])
], ApiLogAdminController);
//# sourceMappingURL=api-log-admin.controller.js.map