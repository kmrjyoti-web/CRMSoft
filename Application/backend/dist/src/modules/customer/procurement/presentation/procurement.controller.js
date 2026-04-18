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
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const unit_service_1 = require("../services/unit.service");
const rfq_service_1 = require("../services/rfq.service");
const purchase_quotation_service_1 = require("../services/purchase-quotation.service");
const compare_engine_service_1 = require("../services/compare-engine.service");
const purchase_order_service_1 = require("../services/purchase-order.service");
const goods_receipt_service_1 = require("../services/goods-receipt.service");
const purchase_invoice_service_1 = require("../services/purchase-invoice.service");
const procurement_dashboard_service_1 = require("../services/procurement-dashboard.service");
const procurement_dto_1 = require("./dto/procurement.dto");
let ProcurementController = class ProcurementController {
    constructor(unitService, rfqService, quotationService, compareEngine, poService, grnService, invoiceService, dashboardService) {
        this.unitService = unitService;
        this.rfqService = rfqService;
        this.quotationService = quotationService;
        this.compareEngine = compareEngine;
        this.poService = poService;
        this.grnService = grnService;
        this.invoiceService = invoiceService;
        this.dashboardService = dashboardService;
    }
    async getDashboard(tenantId) {
        const data = await this.dashboardService.getDashboard(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async listUnits(tenantId, category) {
        const data = await this.unitService.list(tenantId, category);
        return api_response_1.ApiResponse.success(data);
    }
    async getUnit(tenantId, id) {
        const data = await this.unitService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createUnit(tenantId, dto) {
        const data = await this.unitService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Unit created');
    }
    async updateUnit(tenantId, id, dto) {
        const data = await this.unitService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Unit updated');
    }
    async deleteUnit(tenantId, id) {
        const data = await this.unitService.delete(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Unit deleted');
    }
    async listConversions(tenantId, productId) {
        const data = await this.unitService.listConversions(tenantId, productId);
        return api_response_1.ApiResponse.success(data);
    }
    async createConversion(tenantId, dto) {
        const data = await this.unitService.createConversion(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Conversion created');
    }
    async deleteConversion(tenantId, id) {
        const data = await this.unitService.deleteConversion(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Conversion deleted');
    }
    async calculateConversion(tenantId, dto) {
        const data = await this.unitService.calculate(tenantId, dto);
        return api_response_1.ApiResponse.success(data);
    }
    async listRFQ(tenantId, status, page, limit) {
        const result = await this.rfqService.list(tenantId, {
            status, page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generateRFQNumber(tenantId) {
        const number = await this.rfqService.generateNumber(tenantId);
        return api_response_1.ApiResponse.success({ number });
    }
    async getRFQ(tenantId, id) {
        const data = await this.rfqService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createRFQ(tenantId, userId, dto) {
        const data = await this.rfqService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'RFQ created');
    }
    async updateRFQ(tenantId, id, dto) {
        const data = await this.rfqService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'RFQ updated');
    }
    async sendRFQ(tenantId, id, vendorIds) {
        const data = await this.rfqService.sendToVendors(tenantId, id, vendorIds);
        return api_response_1.ApiResponse.success(data, 'RFQ sent to vendors');
    }
    async closeRFQ(tenantId, id) {
        const data = await this.rfqService.close(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'RFQ closed');
    }
    async listQuotations(tenantId, rfqId, vendorId, status, page, limit) {
        const result = await this.quotationService.list(tenantId, {
            rfqId, vendorId, status,
            page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generateQuotationNumber(tenantId) {
        const number = await this.quotationService.generateNumber(tenantId);
        return api_response_1.ApiResponse.success({ number });
    }
    async getQuotation(tenantId, id) {
        const data = await this.quotationService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createQuotation(tenantId, userId, dto) {
        const data = await this.quotationService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Quotation created');
    }
    async compareQuotations(tenantId, dto) {
        const data = await this.compareEngine.compareQuotations(tenantId, dto.rfqId, {
            priceWeight: dto.priceWeight,
            deliveryWeight: dto.deliveryWeight,
            creditWeight: dto.creditWeight,
            qualityWeight: dto.qualityWeight,
        });
        return api_response_1.ApiResponse.success(data);
    }
    async getComparison(tenantId, id) {
        const data = await this.compareEngine.getComparison(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async listComparisons(tenantId, rfqId) {
        const data = await this.compareEngine.listByRfq(tenantId, rfqId);
        return api_response_1.ApiResponse.success(data);
    }
    async selectWinner(tenantId, dto) {
        const data = await this.compareEngine.selectWinner(tenantId, dto.comparisonId, dto.quotationId, dto.remarks);
        return api_response_1.ApiResponse.success(data, 'Winner selected');
    }
    async listPOs(tenantId, vendorId, status, page, limit) {
        const result = await this.poService.list(tenantId, {
            vendorId, status,
            page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generatePONumber(tenantId) {
        const number = await this.poService.generateNumber(tenantId);
        return api_response_1.ApiResponse.success({ number });
    }
    async getPO(tenantId, id) {
        const data = await this.poService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createPO(tenantId, userId, dto) {
        const data = await this.poService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Purchase order created');
    }
    async updatePO(tenantId, id, dto) {
        const data = await this.poService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Purchase order updated');
    }
    async poWorkflowAction(tenantId, userId, id, dto) {
        let data;
        switch (dto.action) {
            case 'submit':
                data = await this.poService.submitForApproval(tenantId, id);
                break;
            case 'approve':
                data = await this.poService.approve(tenantId, id, userId);
                break;
            case 'reject':
                data = await this.poService.reject(tenantId, id, userId, dto.remarks);
                break;
            case 'cancel':
                data = await this.poService.cancel(tenantId, id);
                break;
        }
        return api_response_1.ApiResponse.success(data, `Purchase order ${dto.action}d`);
    }
    async listGRN(tenantId, purchaseOrderId, status, page, limit) {
        const result = await this.grnService.list(tenantId, {
            purchaseOrderId, status,
            page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generateGRNNumber(tenantId) {
        const number = await this.grnService.generateNumber(tenantId);
        return api_response_1.ApiResponse.success({ number });
    }
    async getGRN(tenantId, id) {
        const data = await this.grnService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createGRN(tenantId, userId, dto) {
        const data = await this.grnService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Goods receipt created');
    }
    async grnWorkflowAction(tenantId, userId, id, dto) {
        let data;
        switch (dto.action) {
            case 'approve':
                data = await this.grnService.accept(tenantId, id, userId);
                break;
            case 'reject':
                data = await this.grnService.reject(tenantId, id, userId, dto.remarks);
                break;
            default:
                data = await this.grnService.accept(tenantId, id, userId);
        }
        return api_response_1.ApiResponse.success(data, `GRN ${dto.action}d`);
    }
    async listInvoices(tenantId, vendorId, status, purchaseOrderId, page, limit) {
        const result = await this.invoiceService.list(tenantId, {
            vendorId, status, purchaseOrderId,
            page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generateInvoiceNumber(tenantId) {
        const number = await this.invoiceService.generateNumber(tenantId);
        return api_response_1.ApiResponse.success({ number });
    }
    async getInvoice(tenantId, id) {
        const data = await this.invoiceService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createInvoice(tenantId, userId, dto) {
        const data = await this.invoiceService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Purchase invoice created');
    }
    async invoiceWorkflowAction(tenantId, userId, id, dto) {
        let data;
        switch (dto.action) {
            case 'submit':
                data = await this.invoiceService.submitForApproval(tenantId, id);
                break;
            case 'approve':
                data = await this.invoiceService.approve(tenantId, id, userId);
                break;
            case 'reject':
                data = await this.invoiceService.reject(tenantId, id, userId, dto.remarks);
                break;
            case 'cancel':
                data = await this.invoiceService.cancel(tenantId, id);
                break;
        }
        return api_response_1.ApiResponse.success(data, `Invoice ${dto.action}d`);
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Procurement dashboard KPIs' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('units'),
    (0, swagger_1.ApiOperation)({ summary: 'List units' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listUnits", null);
__decorate([
    (0, common_1.Get)('units/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unit by ID' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getUnit", null);
__decorate([
    (0, common_1.Post)('units'),
    (0, swagger_1.ApiOperation)({ summary: 'Create unit' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, procurement_dto_1.CreateUnitDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Patch)('units/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update unit' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.UpdateUnitDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "updateUnit", null);
__decorate([
    (0, common_1.Delete)('units/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete unit' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "deleteUnit", null);
__decorate([
    (0, common_1.Get)('unit-conversions'),
    (0, swagger_1.ApiOperation)({ summary: 'List unit conversions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listConversions", null);
__decorate([
    (0, common_1.Post)('unit-conversions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create unit conversion' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, procurement_dto_1.CreateUnitConversionDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createConversion", null);
__decorate([
    (0, common_1.Delete)('unit-conversions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete unit conversion' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "deleteConversion", null);
__decorate([
    (0, common_1.Post)('unit-conversions/calculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate unit conversion' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, procurement_dto_1.CalculateConversionDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "calculateConversion", null);
__decorate([
    (0, common_1.Get)('rfq'),
    (0, swagger_1.ApiOperation)({ summary: 'List RFQs' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listRFQ", null);
__decorate([
    (0, common_1.Get)('rfq/generate-number'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next RFQ number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "generateRFQNumber", null);
__decorate([
    (0, common_1.Get)('rfq/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get RFQ detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getRFQ", null);
__decorate([
    (0, common_1.Post)('rfq'),
    (0, swagger_1.ApiOperation)({ summary: 'Create RFQ' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.CreateRFQDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createRFQ", null);
__decorate([
    (0, common_1.Patch)('rfq/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update RFQ' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.UpdateRFQDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "updateRFQ", null);
__decorate([
    (0, common_1.Post)('rfq/:id/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send RFQ to vendors' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('vendorIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "sendRFQ", null);
__decorate([
    (0, common_1.Post)('rfq/:id/close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Close RFQ' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "closeRFQ", null);
__decorate([
    (0, common_1.Get)('quotations'),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase quotations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('rfqId')),
    __param(2, (0, common_1.Query)('vendorId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listQuotations", null);
__decorate([
    (0, common_1.Get)('quotations/generate-number'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next quotation number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "generateQuotationNumber", null);
__decorate([
    (0, common_1.Get)('quotations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase quotation detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getQuotation", null);
__decorate([
    (0, common_1.Post)('quotations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase quotation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.CreatePurchaseQuotationDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createQuotation", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Compare quotations for an RFQ' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, procurement_dto_1.CompareQuotationsDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "compareQuotations", null);
__decorate([
    (0, common_1.Get)('compare/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comparison result' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getComparison", null);
__decorate([
    (0, common_1.Get)('compare/rfq/:rfqId'),
    (0, swagger_1.ApiOperation)({ summary: 'List comparisons for RFQ' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('rfqId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listComparisons", null);
__decorate([
    (0, common_1.Post)('compare/select-winner'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Select winning quotation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, procurement_dto_1.SelectWinnerDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "selectWinner", null);
__decorate([
    (0, common_1.Get)('purchase-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase orders' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listPOs", null);
__decorate([
    (0, common_1.Get)('purchase-orders/generate-number'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next PO number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "generatePONumber", null);
__decorate([
    (0, common_1.Get)('purchase-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase order detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getPO", null);
__decorate([
    (0, common_1.Post)('purchase-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase order' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.CreatePODto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createPO", null);
__decorate([
    (0, common_1.Patch)('purchase-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.UpdatePODto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "updatePO", null);
__decorate([
    (0, common_1.Post)('purchase-orders/:id/workflow'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'PO workflow action (submit/approve/reject/cancel)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, procurement_dto_1.WorkflowActionDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "poWorkflowAction", null);
__decorate([
    (0, common_1.Get)('goods-receipts'),
    (0, swagger_1.ApiOperation)({ summary: 'List goods receipts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('purchaseOrderId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listGRN", null);
__decorate([
    (0, common_1.Get)('goods-receipts/generate-number'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next GRN number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "generateGRNNumber", null);
__decorate([
    (0, common_1.Get)('goods-receipts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goods receipt detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getGRN", null);
__decorate([
    (0, common_1.Post)('goods-receipts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create goods receipt' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.CreateGRNDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createGRN", null);
__decorate([
    (0, common_1.Post)('goods-receipts/:id/workflow'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'GRN workflow action (accept/reject)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, procurement_dto_1.WorkflowActionDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "grnWorkflowAction", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase invoices' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('purchaseOrderId')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "listInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/generate-number'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next invoice number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "generateInvoiceNumber", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase invoice detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase invoice' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, procurement_dto_1.CreatePurchaseInvoiceDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/workflow'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Invoice workflow action (submit/approve/reject/cancel)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('procurement:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, procurement_dto_1.WorkflowActionDto]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "invoiceWorkflowAction", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, swagger_1.ApiTags)('Procurement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('procurement'),
    __metadata("design:paramtypes", [unit_service_1.UnitService,
        rfq_service_1.RFQService,
        purchase_quotation_service_1.PurchaseQuotationService,
        compare_engine_service_1.CompareEngineService,
        purchase_order_service_1.PurchaseOrderService,
        goods_receipt_service_1.GoodsReceiptService,
        purchase_invoice_service_1.PurchaseInvoiceService,
        procurement_dashboard_service_1.ProcurementDashboardService])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map