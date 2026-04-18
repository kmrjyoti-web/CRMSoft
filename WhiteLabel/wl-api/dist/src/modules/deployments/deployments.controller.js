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
exports.DeploymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const deployments_service_1 = require("./deployments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const class_validator_1 = require("class-validator");
class DeployDto {
    version;
    gitTag;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeployDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeployDto.prototype, "gitTag", void 0);
class RollbackDto {
    targetVersion;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RollbackDto.prototype, "targetVersion", void 0);
let DeploymentsController = class DeploymentsController {
    deploymentsService;
    constructor(deploymentsService) {
        this.deploymentsService = deploymentsService;
    }
    deploy(partnerId, dto) {
        return this.deploymentsService.deploy(partnerId, dto);
    }
    rollback(partnerId, dto) {
        return this.deploymentsService.rollback(partnerId, dto.targetVersion);
    }
    getDeployment(partnerId) {
        return this.deploymentsService.getDeployment(partnerId);
    }
    checkHealth(partnerId) {
        return this.deploymentsService.checkHealth(partnerId);
    }
    getHistory(partnerId) {
        return this.deploymentsService.getHistory(partnerId);
    }
    checkAllHealth() {
        return this.deploymentsService.checkAllHealth();
    }
};
exports.DeploymentsController = DeploymentsController;
__decorate([
    (0, common_1.Post)(':partnerId/deploy'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DeployDto]),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "deploy", null);
__decorate([
    (0, common_1.Post)(':partnerId/rollback'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RollbackDto]),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "rollback", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "getDeployment", null);
__decorate([
    (0, common_1.Get)(':partnerId/health'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)(':partnerId/history'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('health-check-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeploymentsController.prototype, "checkAllHealth", null);
exports.DeploymentsController = DeploymentsController = __decorate([
    (0, swagger_1.ApiTags)('deployments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('deployments'),
    __metadata("design:paramtypes", [deployments_service_1.DeploymentsService])
], DeploymentsController);
//# sourceMappingURL=deployments.controller.js.map