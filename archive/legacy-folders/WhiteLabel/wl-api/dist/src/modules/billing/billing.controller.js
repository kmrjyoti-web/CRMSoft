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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const class_validator_1 = require("class-validator");
class RecordUsageDto {
    partnerId;
    serviceCode;
    units;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordUsageDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordUsageDto.prototype, "serviceCode", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordUsageDto.prototype, "units", void 0);
class MarkPaidDto {
    razorpayPaymentId;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkPaidDto.prototype, "razorpayPaymentId", void 0);
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    recordUsage(dto) {
        return this.billingService.recordUsage(dto);
    }
    getUsageSummary(partnerId, period) {
        return this.billingService.getUsageSummary(partnerId, period);
    }
    getUsageByPeriod(partnerId, period) {
        return this.billingService.getUsageSummary(partnerId, period);
    }
    generateInvoice(partnerId, period) {
        return this.billingService.generateInvoice(partnerId, period);
    }
    sendInvoice(id) {
        return this.billingService.sendInvoice(id);
    }
    markPaid(id, dto) {
        return this.billingService.markPaid(id, dto.razorpayPaymentId);
    }
    getBillingDashboard() {
        return this.billingService.getBillingDashboard();
    }
    getPartnerInvoices(partnerId, page = '1', limit = '20') {
        return this.billingService.getPartnerInvoices(partnerId, +page, +limit);
    }
    getInvoice(id) {
        return this.billingService.getInvoice(id);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('usage/record'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RecordUsageDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "recordUsage", null);
__decorate([
    (0, common_1.Get)('usage/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getUsageSummary", null);
__decorate([
    (0, common_1.Get)('usage/:partnerId/:period'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getUsageByPeriod", null);
__decorate([
    (0, common_1.Post)('invoices/generate/:partnerId/:period'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/send'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sendInvoice", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MarkPaidDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Get)('invoices/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getBillingDashboard", null);
__decorate([
    (0, common_1.Get)('invoices/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getPartnerInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id/detail'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getInvoice", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('billing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map