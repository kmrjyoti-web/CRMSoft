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
exports.WarrantyClaimController = void 0;
const common_1 = require("@nestjs/common");
const warranty_claim_service_1 = require("../services/warranty-claim.service");
let WarrantyClaimController = class WarrantyClaimController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(req, q) {
        return this.svc.findAll(req.user.tenantId, q);
    }
    findOne(req, id) {
        return this.svc.findById(req.user.tenantId, id);
    }
    create(req, dto) {
        return this.svc.create(req.user.tenantId, dto);
    }
    update(req, id, dto) {
        return this.svc.update(req.user.tenantId, id, dto);
    }
    reject(req, id, dto) {
        return this.svc.reject(req.user.tenantId, id, dto.reason);
    }
};
exports.WarrantyClaimController = WarrantyClaimController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarrantyClaimController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarrantyClaimController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarrantyClaimController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WarrantyClaimController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WarrantyClaimController.prototype, "reject", null);
exports.WarrantyClaimController = WarrantyClaimController = __decorate([
    (0, common_1.Controller)('warranty/claims'),
    __metadata("design:paramtypes", [warranty_claim_service_1.WarrantyClaimService])
], WarrantyClaimController);
//# sourceMappingURL=warranty-claim.controller.js.map