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
exports.EntityVerificationController = void 0;
const common_1 = require("@nestjs/common");
const entity_verification_service_1 = require("../services/entity-verification.service");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const entity_verification_dto_1 = require("./dto/entity-verification.dto");
let EntityVerificationController = class EntityVerificationController {
    constructor(service) {
        this.service = service;
    }
    async initiate(user, dto) {
        const result = await this.service.initiateVerification(user.tenantId ?? '', user.id, `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email, dto);
        return api_response_1.ApiResponse.success(result);
    }
    async verifyOtp(user, dto) {
        const result = await this.service.verifyOtp(user.tenantId ?? '', dto.recordId, dto.otp);
        return api_response_1.ApiResponse.success(result);
    }
    async resend(user, recordId) {
        const result = await this.service.resend(user.tenantId ?? '', user.id, `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email, recordId);
        return api_response_1.ApiResponse.success(result);
    }
    async getHistory(user, entityType, entityId) {
        const result = await this.service.getHistory(user.tenantId ?? '', entityType, entityId);
        return api_response_1.ApiResponse.success(result);
    }
    async getStatus(user, entityType, entityId) {
        const result = await this.service.getStatus(user.tenantId ?? '', entityType, entityId);
        return api_response_1.ApiResponse.success(result);
    }
    async getPending(user) {
        const result = await this.service.getPending(user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result);
    }
    async resetVerification(user, entityType, entityId) {
        const result = await this.service.resetVerification(user.tenantId ?? '', entityType, entityId);
        return api_response_1.ApiResponse.success(result);
    }
    async expireOld() {
        const result = await this.service.expireOld();
        return api_response_1.ApiResponse.success(result);
    }
    async getReportSummary(user, dateFrom, dateTo) {
        const result = await this.service.getReportSummary(user.tenantId ?? '', dateFrom, dateTo);
        return api_response_1.ApiResponse.success(result);
    }
    async getReportList(user, status, channel, mode, entityType, dateFrom, dateTo, search, page, limit) {
        const result = await this.service.getReportList(user.tenantId ?? '', {
            status, channel, mode, entityType, dateFrom, dateTo, search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getExpiredLinks(user) {
        const result = await this.service.getExpiredLinks(user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result);
    }
    async getVerificationTrend(user, days) {
        const result = await this.service.getVerificationTrend(user.tenantId ?? '', days ? parseInt(days) : 30);
        return api_response_1.ApiResponse.success(result);
    }
    async exportCsv(user, res, status, dateFrom, dateTo) {
        const csv = await this.service.exportCsv(user.tenantId ?? '', { status, dateFrom, dateTo });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=verification-report-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    }
};
exports.EntityVerificationController = EntityVerificationController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entity_verification_dto_1.InitiateVerificationDto]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "initiate", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entity_verification_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend/:recordId'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "resend", null);
__decorate([
    (0, common_1.Get)('history/:entityType/:entityId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('status/:entityType/:entityId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)('reset/:entityType/:entityId'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "resetVerification", null);
__decorate([
    (0, common_1.Post)('expire-old'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "expireOld", null);
__decorate([
    (0, common_1.Get)('report/summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getReportSummary", null);
__decorate([
    (0, common_1.Get)('report/list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('channel')),
    __param(3, (0, common_1.Query)('mode')),
    __param(4, (0, common_1.Query)('entityType')),
    __param(5, (0, common_1.Query)('dateFrom')),
    __param(6, (0, common_1.Query)('dateTo')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getReportList", null);
__decorate([
    (0, common_1.Get)('report/expired-links'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getExpiredLinks", null);
__decorate([
    (0, common_1.Get)('report/trend'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "getVerificationTrend", null);
__decorate([
    (0, common_1.Get)('report/export'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('dateFrom')),
    __param(4, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], EntityVerificationController.prototype, "exportCsv", null);
exports.EntityVerificationController = EntityVerificationController = __decorate([
    (0, common_1.Controller)('entity-verification'),
    __metadata("design:paramtypes", [entity_verification_service_1.EntityVerificationService])
], EntityVerificationController);
//# sourceMappingURL=entity-verification.controller.js.map