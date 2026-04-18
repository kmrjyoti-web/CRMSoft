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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const sale_order_service_1 = require("../services/sale-order.service");
const delivery_challan_service_1 = require("../services/delivery-challan.service");
const sale_return_service_1 = require("../services/sale-return.service");
const credit_note_enhanced_service_1 = require("../services/credit-note-enhanced.service");
const debit_note_service_1 = require("../services/debit-note.service");
const sales_dto_1 = require("./dto/sales.dto");
let SalesController = class SalesController {
    constructor(saleOrderService, deliveryChallanService, saleReturnService, creditNoteService, debitNoteService) {
        this.saleOrderService = saleOrderService;
        this.deliveryChallanService = deliveryChallanService;
        this.saleReturnService = saleReturnService;
        this.creditNoteService = creditNoteService;
        this.debitNoteService = debitNoteService;
    }
    async createOrder(tenantId, userId, dto) {
        const data = await this.saleOrderService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Sale order created');
    }
    async listOrders(tenantId, status, customerId) {
        const data = await this.saleOrderService.findAll(tenantId, { status, customerId });
        return api_response_1.ApiResponse.success(data);
    }
    async getOrder(tenantId, id) {
        const data = await this.saleOrderService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async updateOrder(tenantId, id, dto) {
        const data = await this.saleOrderService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Sale order updated');
    }
    async approveOrder(tenantId, userId, id) {
        const data = await this.saleOrderService.approve(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Sale order approved');
    }
    async rejectOrder(tenantId, id, reason) {
        const data = await this.saleOrderService.reject(tenantId, id, reason ?? '');
        return api_response_1.ApiResponse.success(data, 'Sale order rejected');
    }
    async convertToInvoice(tenantId, userId, id) {
        const data = await this.saleOrderService.convertToInvoice(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Invoice created from sale order');
    }
    async cancelOrder(tenantId, id) {
        const data = await this.saleOrderService.cancel(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Sale order cancelled');
    }
    async createChallan(tenantId, userId, dto) {
        const data = await this.deliveryChallanService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Delivery challan created');
    }
    async listChallans(tenantId, status, saleOrderId) {
        const data = await this.deliveryChallanService.findAll(tenantId, { status, saleOrderId });
        return api_response_1.ApiResponse.success(data);
    }
    async getChallan(tenantId, id) {
        const data = await this.deliveryChallanService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async dispatchChallan(tenantId, userId, id) {
        const data = await this.deliveryChallanService.dispatch(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Delivery challan dispatched');
    }
    async deliverChallan(tenantId, id) {
        const data = await this.deliveryChallanService.deliver(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Delivery challan marked as delivered');
    }
    async cancelChallan(tenantId, id) {
        const data = await this.deliveryChallanService.cancel(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Delivery challan cancelled');
    }
    async createReturn(tenantId, userId, dto) {
        const data = await this.saleReturnService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Sale return created');
    }
    async listReturns(tenantId, status) {
        const data = await this.saleReturnService.findAll(tenantId, { status });
        return api_response_1.ApiResponse.success(data);
    }
    async getReturn(tenantId, id) {
        const data = await this.saleReturnService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async inspectReturn(tenantId, id, dto) {
        const data = await this.saleReturnService.inspect(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Sale return inspected');
    }
    async acceptReturn(tenantId, userId, id) {
        const data = await this.saleReturnService.accept(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Sale return accepted');
    }
    async rejectReturn(tenantId, id) {
        const data = await this.saleReturnService.reject(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Sale return rejected');
    }
    async createCreditNote(tenantId, userId, dto) {
        const data = await this.creditNoteService.createManual(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Credit note created');
    }
    async listCreditNotes(tenantId) {
        const data = await this.creditNoteService.findAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getCreditNote(tenantId, id) {
        const data = await this.creditNoteService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async issueCreditNote(tenantId, userId, id) {
        const data = await this.creditNoteService.issue(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Credit note issued');
    }
    async adjustCreditNote(tenantId, id, dto) {
        const data = await this.creditNoteService.adjust(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Credit note adjusted');
    }
    async createDebitNote(tenantId, userId, dto) {
        const data = await this.debitNoteService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Debit note created');
    }
    async listDebitNotes(tenantId) {
        const data = await this.debitNoteService.findAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getDebitNote(tenantId, id) {
        const data = await this.debitNoteService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async issueDebitNote(tenantId, userId, id) {
        const data = await this.debitNoteService.issue(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Debit note issued');
    }
    async adjustDebitNote(tenantId, id, dto) {
        const data = await this.debitNoteService.adjust(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Debit note adjusted');
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a sale order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.CreateSaleOrderDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List sale orders' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "listOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale order by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a sale order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.UpdateSaleOrderDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a sale order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "approveOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a sale order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "rejectOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/convert-invoice'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert sale order to invoice' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "convertToInvoice", null);
__decorate([
    (0, common_1.Post)('orders/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a sale order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)('delivery-challans'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a delivery challan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.CreateDeliveryChallanDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createChallan", null);
__decorate([
    (0, common_1.Get)('delivery-challans'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List delivery challans' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('saleOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "listChallans", null);
__decorate([
    (0, common_1.Get)('delivery-challans/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery challan by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getChallan", null);
__decorate([
    (0, common_1.Post)('delivery-challans/:id/dispatch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Dispatch a delivery challan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "dispatchChallan", null);
__decorate([
    (0, common_1.Post)('delivery-challans/:id/deliver'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery challan as delivered' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "deliverChallan", null);
__decorate([
    (0, common_1.Post)('delivery-challans/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a delivery challan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "cancelChallan", null);
__decorate([
    (0, common_1.Post)('returns'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a sale return' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.CreateSaleReturnDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createReturn", null);
__decorate([
    (0, common_1.Get)('returns'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List sale returns' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "listReturns", null);
__decorate([
    (0, common_1.Get)('returns/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale return by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getReturn", null);
__decorate([
    (0, common_1.Post)('returns/:id/inspect'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Inspect a sale return' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.InspectReturnDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "inspectReturn", null);
__decorate([
    (0, common_1.Post)('returns/:id/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a sale return' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "acceptReturn", null);
__decorate([
    (0, common_1.Post)('returns/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a sale return' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "rejectReturn", null);
__decorate([
    (0, common_1.Post)('credit-notes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a credit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.CreateCreditNoteDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createCreditNote", null);
__decorate([
    (0, common_1.Get)('credit-notes'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List credit notes' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "listCreditNotes", null);
__decorate([
    (0, common_1.Get)('credit-notes/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get credit note by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getCreditNote", null);
__decorate([
    (0, common_1.Post)('credit-notes/:id/issue'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a credit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "issueCreditNote", null);
__decorate([
    (0, common_1.Post)('credit-notes/:id/adjust'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust a credit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.AdjustNoteDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "adjustCreditNote", null);
__decorate([
    (0, common_1.Post)('debit-notes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a debit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.CreateDebitNoteDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createDebitNote", null);
__decorate([
    (0, common_1.Get)('debit-notes'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List debit notes' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "listDebitNotes", null);
__decorate([
    (0, common_1.Get)('debit-notes/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get debit note by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getDebitNote", null);
__decorate([
    (0, common_1.Post)('debit-notes/:id/issue'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a debit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "issueDebitNote", null);
__decorate([
    (0, common_1.Post)('debit-notes/:id/adjust'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('sales:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust a debit note' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sales_dto_1.AdjustNoteDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "adjustDebitNote", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('Sales'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sales'),
    __metadata("design:paramtypes", [sale_order_service_1.SaleOrderService,
        delivery_challan_service_1.DeliveryChallanService,
        sale_return_service_1.SaleReturnService,
        credit_note_enhanced_service_1.CreditNoteEnhancedService,
        debit_note_service_1.DebitNoteService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map