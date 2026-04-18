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
exports.SecurityPolicyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_policy_service_1 = require("../services/security-policy.service");
const update_security_policy_dto_1 = require("./dto/update-security-policy.dto");
let SecurityPolicyController = class SecurityPolicyController {
    constructor(service) {
        this.service = service;
    }
    get(req) {
        return this.service.get(req.user.tenantId);
    }
    update(req, dto) {
        return this.service.update(req.user.tenantId, dto, req.user.id);
    }
    addIpRule(req, dto) {
        return this.service.addIpRule(req.user.tenantId, dto);
    }
    removeIpRule(id) {
        return this.service.removeIpRule(id);
    }
    listIpRules(req) {
        return this.service.listIpRules(req.user.tenantId);
    }
};
exports.SecurityPolicyController = SecurityPolicyController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityPolicyController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_security_policy_dto_1.UpdateSecurityPolicyDto]),
    __metadata("design:returntype", void 0)
], SecurityPolicyController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('ip-rules'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_security_policy_dto_1.CreateIpRuleDto]),
    __metadata("design:returntype", void 0)
], SecurityPolicyController.prototype, "addIpRule", null);
__decorate([
    (0, common_1.Delete)('ip-rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityPolicyController.prototype, "removeIpRule", null);
__decorate([
    (0, common_1.Get)('ip-rules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityPolicyController.prototype, "listIpRules", null);
exports.SecurityPolicyController = SecurityPolicyController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Security Policy'),
    (0, common_1.Controller)('settings/security'),
    __metadata("design:paramtypes", [security_policy_service_1.SecurityPolicyService])
], SecurityPolicyController);
//# sourceMappingURL=security-policy.controller.js.map