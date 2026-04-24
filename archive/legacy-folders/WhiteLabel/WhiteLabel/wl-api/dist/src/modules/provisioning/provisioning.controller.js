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
exports.ProvisioningController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const provisioning_service_1 = require("./provisioning.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const class_validator_1 = require("class-validator");
class DeprovisionDto {
    confirmation;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeprovisionDto.prototype, "confirmation", void 0);
let ProvisioningController = class ProvisioningController {
    provisioningService;
    constructor(provisioningService) {
        this.provisioningService = provisioningService;
    }
    provision(partnerId) {
        return this.provisioningService.provision(partnerId);
    }
    getStatus(partnerId) {
        return this.provisioningService.getStatus(partnerId);
    }
    deprovision(partnerId, dto) {
        return this.provisioningService.deprovision(partnerId, dto.confirmation);
    }
    reprovision(partnerId) {
        return this.provisioningService.reprovision(partnerId);
    }
    getDatabases(partnerId) {
        return this.provisioningService.getDatabases(partnerId);
    }
};
exports.ProvisioningController = ProvisioningController;
__decorate([
    (0, common_1.Post)(':partnerId/provision'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProvisioningController.prototype, "provision", null);
__decorate([
    (0, common_1.Get)(':partnerId/status'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProvisioningController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(':partnerId/deprovision'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DeprovisionDto]),
    __metadata("design:returntype", void 0)
], ProvisioningController.prototype, "deprovision", null);
__decorate([
    (0, common_1.Post)(':partnerId/reprovision'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProvisioningController.prototype, "reprovision", null);
__decorate([
    (0, common_1.Get)(':partnerId/databases'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProvisioningController.prototype, "getDatabases", null);
exports.ProvisioningController = ProvisioningController = __decorate([
    (0, swagger_1.ApiTags)('provisioning'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('provisioning'),
    __metadata("design:paramtypes", [provisioning_service_1.ProvisioningService])
], ProvisioningController);
//# sourceMappingURL=provisioning.controller.js.map