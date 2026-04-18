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
exports.EmailFooterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_footer_service_1 = require("../services/email-footer.service");
const email_footer_dto_1 = require("./dto/email-footer.dto");
let EmailFooterController = class EmailFooterController {
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.list(req.user.tenantId);
    }
    create(req, dto) {
        return this.service.create(req.user.tenantId, dto);
    }
    update(req, id, dto) {
        return this.service.update(req.user.tenantId, id, dto);
    }
};
exports.EmailFooterController = EmailFooterController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailFooterController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, email_footer_dto_1.CreateEmailFooterDto]),
    __metadata("design:returntype", void 0)
], EmailFooterController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, email_footer_dto_1.UpdateEmailFooterDto]),
    __metadata("design:returntype", void 0)
], EmailFooterController.prototype, "update", null);
exports.EmailFooterController = EmailFooterController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Email Footer'),
    (0, common_1.Controller)('settings/email-footers'),
    __metadata("design:paramtypes", [email_footer_service_1.EmailFooterService])
], EmailFooterController);
//# sourceMappingURL=email-footer.controller.js.map