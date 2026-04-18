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
exports.PublicEntityVerificationController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../../common/decorators/roles.decorator");
const entity_verification_service_1 = require("../services/entity-verification.service");
const api_response_1 = require("../../../../common/utils/api-response");
const entity_verification_dto_1 = require("./dto/entity-verification.dto");
let PublicEntityVerificationController = class PublicEntityVerificationController {
    constructor(service) {
        this.service = service;
    }
    async getPage(token) {
        const result = await this.service.getVerificationPage(token);
        return api_response_1.ApiResponse.success(result);
    }
    async confirm(token, req) {
        const result = await this.service.confirmVerification(token, req.ip ?? '', req.headers['user-agent'] ?? '');
        return api_response_1.ApiResponse.success(result);
    }
    async reject(token, dto, req) {
        const result = await this.service.rejectVerification(token, dto.reason ?? '', req.ip ?? '');
        return api_response_1.ApiResponse.success(result);
    }
};
exports.PublicEntityVerificationController = PublicEntityVerificationController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicEntityVerificationController.prototype, "getPage", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)(':token/confirm'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicEntityVerificationController.prototype, "confirm", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)(':token/reject'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entity_verification_dto_1.RejectVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEntityVerificationController.prototype, "reject", null);
exports.PublicEntityVerificationController = PublicEntityVerificationController = __decorate([
    (0, common_1.Controller)('public/entity-verify'),
    __metadata("design:paramtypes", [entity_verification_service_1.EntityVerificationService])
], PublicEntityVerificationController);
//# sourceMappingURL=public-entity-verification.controller.js.map