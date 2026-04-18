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
exports.WarrantyRecordController = void 0;
const common_1 = require("@nestjs/common");
const warranty_record_service_1 = require("../services/warranty-record.service");
let WarrantyRecordController = class WarrantyRecordController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(req, q) {
        return this.svc.findAll(req.user.tenantId, q);
    }
    expiring(req, days) {
        return this.svc.findExpiring(req.user.tenantId, days ? +days : 30);
    }
    checkSerial(req, s) {
        return this.svc.checkBySerial(req.user.tenantId, s);
    }
    findOne(req, id) {
        return this.svc.findById(req.user.tenantId, id);
    }
    extend(req, id, dto) {
        return this.svc.extend(req.user.tenantId, id, dto);
    }
};
exports.WarrantyRecordController = WarrantyRecordController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarrantyRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expiring'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarrantyRecordController.prototype, "expiring", null);
__decorate([
    (0, common_1.Get)('check/:serialId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('serialId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarrantyRecordController.prototype, "checkSerial", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarrantyRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/extend'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WarrantyRecordController.prototype, "extend", null);
exports.WarrantyRecordController = WarrantyRecordController = __decorate([
    (0, common_1.Controller)('warranty/records'),
    __metadata("design:paramtypes", [warranty_record_service_1.WarrantyRecordService])
], WarrantyRecordController);
//# sourceMappingURL=warranty-record.controller.js.map