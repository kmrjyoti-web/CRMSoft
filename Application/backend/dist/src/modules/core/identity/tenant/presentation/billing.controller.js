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
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const recalculate_usage_command_1 = require("../application/commands/recalculate-usage/recalculate-usage.command");
const query_1 = require("../application/queries/list-invoices/query");
const invoice_query_dto_1 = require("./dto/invoice-query.dto");
const payment_webhook_dto_1 = require("./dto/payment-webhook.dto");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../../../common/decorators/roles.decorator");
const invoice_generator_service_1 = require("../services/invoice-generator.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let BillingController = class BillingController {
    constructor(commandBus, queryBus, invoiceGenerator) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.invoiceGenerator = invoiceGenerator;
    }
    async listInvoices(query, tenantId) {
        const result = await this.queryBus.execute(new query_1.ListInvoicesQuery(tenantId, query.page ?? 1, query.limit ?? 20, query.status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async downloadInvoice(id) {
        const pdfUrl = await this.invoiceGenerator.generatePdf(id);
        return api_response_1.ApiResponse.success({ pdfUrl }, 'Invoice PDF generated');
    }
    async razorpayWebhook(dto) {
        return api_response_1.ApiResponse.success(null, 'Webhook received');
    }
    async recalculateUsage(tenantId) {
        await this.commandBus.execute(new recalculate_usage_command_1.RecalculateUsageCommand(tenantId));
        return api_response_1.ApiResponse.success(null, 'Usage recalculated');
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'List invoices for current tenant' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_query_dto_1.InvoiceQueryDto, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "listInvoices", null);
__decorate([
    (0, common_1.Post)('invoices/:id/download'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and download invoice PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Post)('webhook/razorpay'),
    (0, roles_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Razorpay payment webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_webhook_dto_1.PaymentWebhookDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "razorpayWebhook", null);
__decorate([
    (0, common_1.Post)('recalculate-usage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate tenant usage (admin only)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "recalculateUsage", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenant/billing'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        invoice_generator_service_1.InvoiceGeneratorService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map