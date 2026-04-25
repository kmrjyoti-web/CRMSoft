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
exports.DomainsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const domains_service_1 = require("./domains.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class AddDomainDto {
    partnerId;
    domain;
    domainType;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddDomainDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddDomainDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DomainType),
    __metadata("design:type", String)
], AddDomainDto.prototype, "domainType", void 0);
let DomainsController = class DomainsController {
    domainsService;
    constructor(domainsService) {
        this.domainsService = domainsService;
    }
    add(dto) { return this.domainsService.add(dto); }
    listByPartner(partnerId) { return this.domainsService.listByPartner(partnerId); }
    remove(id) { return this.domainsService.remove(id); }
    verify(id) { return this.domainsService.verify(id); }
    getDnsRecords(id) { return this.domainsService.getDnsRecords(id); }
};
exports.DomainsController = DomainsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AddDomainDto]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "add", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "listByPartner", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)(':id/dns-records'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "getDnsRecords", null);
exports.DomainsController = DomainsController = __decorate([
    (0, swagger_1.ApiTags)('domains'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('domains'),
    __metadata("design:paramtypes", [domains_service_1.DomainsService])
], DomainsController);
//# sourceMappingURL=domains.controller.js.map