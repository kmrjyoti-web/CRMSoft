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
exports.AutoNumberController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auto_number_service_1 = require("../services/auto-number.service");
const update_auto_number_dto_1 = require("./dto/update-auto-number.dto");
let AutoNumberController = class AutoNumberController {
    constructor(service) {
        this.service = service;
    }
    getAll(req) {
        return this.service.getAll(req.user.tenantId);
    }
    getOne(req, entity) {
        return this.service.getOne(req.user.tenantId, entity);
    }
    update(req, entity, dto) {
        return this.service.update(req.user.tenantId, entity, dto);
    }
    preview(req, entity) {
        return this.service.preview(req.user.tenantId, entity).then((number) => ({ number }));
    }
    reset(req, entity, dto) {
        return this.service.resetSequence(req.user.tenantId, entity, dto.newStart);
    }
};
exports.AutoNumberController = AutoNumberController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AutoNumberController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':entity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoNumberController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':entity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('entity')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_auto_number_dto_1.UpdateAutoNumberDto]),
    __metadata("design:returntype", void 0)
], AutoNumberController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':entity/preview'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AutoNumberController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(':entity/reset'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('entity')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_auto_number_dto_1.ResetSequenceDto]),
    __metadata("design:returntype", void 0)
], AutoNumberController.prototype, "reset", null);
exports.AutoNumberController = AutoNumberController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Auto Numbering'),
    (0, common_1.Controller)('settings/auto-numbering'),
    __metadata("design:paramtypes", [auto_number_service_1.AutoNumberService])
], AutoNumberController);
//# sourceMappingURL=auto-number.controller.js.map