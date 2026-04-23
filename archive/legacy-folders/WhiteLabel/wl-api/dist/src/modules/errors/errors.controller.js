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
exports.ErrorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const errors_service_1 = require("./errors.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CollectErrorsDto {
    errors;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CollectErrorsDto.prototype, "errors", void 0);
class ResolveDto {
    resolution;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveDto.prototype, "resolution", void 0);
let ErrorsController = class ErrorsController {
    errorsService;
    constructor(errorsService) {
        this.errorsService = errorsService;
    }
    collect(partnerId, dto) {
        return this.errorsService.collectErrors(partnerId, dto.errors);
    }
    dashboard(partnerId) {
        return this.errorsService.getErrorDashboard(partnerId);
    }
    getPartnerErrors(partnerId, severity, page = '1', limit = '20') {
        return this.errorsService.getPartnerErrors(partnerId, { severity, page: +page, limit: +limit });
    }
    resolve(errorId, dto) {
        return this.errorsService.resolveError(errorId, dto.resolution);
    }
};
exports.ErrorsController = ErrorsController;
__decorate([
    (0, common_1.Post)(':partnerId/collect'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CollectErrorsDto]),
    __metadata("design:returntype", void 0)
], ErrorsController.prototype, "collect", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErrorsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ErrorsController.prototype, "getPartnerErrors", null);
__decorate([
    (0, common_1.Patch)(':errorId/resolve'),
    __param(0, (0, common_1.Param)('errorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResolveDto]),
    __metadata("design:returntype", void 0)
], ErrorsController.prototype, "resolve", null);
exports.ErrorsController = ErrorsController = __decorate([
    (0, swagger_1.ApiTags)('errors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('errors'),
    __metadata("design:paramtypes", [errors_service_1.ErrorsService])
], ErrorsController);
//# sourceMappingURL=errors.controller.js.map