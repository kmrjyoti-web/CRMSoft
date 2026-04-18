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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("../services/payment.service");
const payment_analytics_service_1 = require("../services/payment-analytics.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService, analytics) {
        this.paymentService = paymentService;
        this.analytics = analytics;
    }
    recordPayment(req, dto) {
        return this.paymentService.recordPayment(req.user.tenantId, dto, req.user.id);
    }
    createGatewayOrder(req, dto) {
        return this.paymentService.createGatewayOrder(req.user.tenantId, dto, req.user.id);
    }
    verifyGatewayPayment(req, dto) {
        return this.paymentService.verifyGatewayPayment(req.user.tenantId, dto);
    }
    list(req, query) {
        return this.paymentService.list(req.user.tenantId, query);
    }
    collection(req, fromDate, toDate) {
        return this.analytics.getCollectionSummary(req.user.tenantId, fromDate, toDate);
    }
    outstanding(req) {
        return this.analytics.getOutstandingSummary(req.user.tenantId);
    }
    refundSummary(req) {
        return this.analytics.getRefundSummary(req.user.tenantId);
    }
    getById(req, id) {
        return this.paymentService.getById(req.user.tenantId, id);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('record'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.RecordPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('gateway/order'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.CreateGatewayOrderDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "createGatewayOrder", null);
__decorate([
    (0, common_1.Post)('gateway/verify'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.VerifyGatewayPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "verifyGatewayPayment", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.PaymentQueryDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('analytics/collection'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "collection", null);
__decorate([
    (0, common_1.Get)('analytics/outstanding'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "outstanding", null);
__decorate([
    (0, common_1.Get)('analytics/refunds'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "refundSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getById", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        payment_analytics_service_1.PaymentAnalyticsService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map