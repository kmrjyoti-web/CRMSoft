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
exports.VerificationController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const verification_service_1 = require("../services/verification.service");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
let VerificationController = class VerificationController {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async getStatus(userId) {
        return this.verificationService.getVerificationStatus(userId);
    }
    async sendEmailOtp(userId, req) {
        return this.verificationService.sendEmailVerification(userId, req.ip, req.headers['user-agent']);
    }
    async verifyEmail(userId, body) {
        return this.verificationService.verifyEmail(userId, body.otp);
    }
    async sendMobileOtp(userId, req) {
        return this.verificationService.sendMobileVerification(userId, req.ip, req.headers['user-agent']);
    }
    async verifyMobile(userId, body) {
        return this.verificationService.verifyMobile(userId, body.otp);
    }
    async submitGst(userId, body) {
        return this.verificationService.submitGstForVerification(userId, body.gstNumber, body.companyName, body.businessType);
    }
    async approveGst(approvedById, userId, body) {
        return this.verificationService.approveGstManually(userId, approvedById, body.notes);
    }
    async canPerformAction(userId, action) {
        const canPerform = await this.verificationService.canPerformAction(userId, action);
        return { action, canPerform };
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('email/send'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "sendEmailOtp", null);
__decorate([
    (0, common_1.Post)('email/verify'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('mobile/send'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "sendMobileOtp", null);
__decorate([
    (0, common_1.Post)('mobile/verify'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "verifyMobile", null);
__decorate([
    (0, common_1.Post)('gst/submit'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "submitGst", null);
__decorate([
    (0, common_1.Post)('gst/approve/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "approveGst", null);
__decorate([
    (0, common_1.Get)('can-perform/:action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "canPerformAction", null);
exports.VerificationController = VerificationController = __decorate([
    (0, common_1.Controller)('verification'),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], VerificationController);
//# sourceMappingURL=verification.controller.js.map