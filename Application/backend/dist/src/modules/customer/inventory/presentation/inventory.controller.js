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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const inventory_service_1 = require("../services/inventory.service");
const serial_service_1 = require("../services/serial.service");
const transaction_service_1 = require("../services/transaction.service");
const location_service_1 = require("../services/location.service");
const adjustment_service_1 = require("../services/adjustment.service");
const report_service_1 = require("../services/report.service");
const inventory_dto_1 = require("./dto/inventory.dto");
let InventoryController = class InventoryController {
    constructor(inventoryService, serialService, transactionService, locationService, adjustmentService, reportService) {
        this.inventoryService = inventoryService;
        this.serialService = serialService;
        this.transactionService = transactionService;
        this.locationService = locationService;
        this.adjustmentService = adjustmentService;
        this.reportService = reportService;
    }
    async getDashboard(tenantId) {
        const data = await this.inventoryService.getDashboard(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async listSerials(tenantId, productId, status, locationId, page, limit) {
        const result = await this.serialService.list(tenantId, {
            productId, status, locationId,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async searchSerials(tenantId, query) {
        const data = await this.serialService.search(tenantId, query);
        return api_response_1.ApiResponse.success(data);
    }
    async getExpiringSerials(tenantId, days) {
        const data = await this.serialService.getExpiring(tenantId, days ? parseInt(days) : 30);
        return api_response_1.ApiResponse.success(data);
    }
    async getSerial(tenantId, id) {
        const data = await this.serialService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createSerial(tenantId, dto) {
        const data = await this.serialService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Serial created');
    }
    async bulkCreateSerials(tenantId, dto) {
        const data = await this.serialService.bulkCreate(tenantId, dto.items);
        return api_response_1.ApiResponse.success(data, `${data.created} serials created`);
    }
    async updateSerial(tenantId, id, dto) {
        const data = await this.serialService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Serial updated');
    }
    async changeSerialStatus(tenantId, id, dto) {
        const data = await this.serialService.changeStatus(tenantId, id, dto.status, dto.customerId, dto.invoiceId);
        return api_response_1.ApiResponse.success(data, 'Status changed');
    }
    async recordTransaction(tenantId, userId, dto) {
        const data = await this.transactionService.record(tenantId, { ...dto, createdById: userId });
        return api_response_1.ApiResponse.success(data, 'Transaction recorded');
    }
    async listTransactions(tenantId, productId, transactionType, locationId, startDate, endDate, page, limit) {
        const result = await this.transactionService.list(tenantId, {
            productId, transactionType, locationId, startDate, endDate,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getStockLedger(tenantId, productId, locationId, startDate, endDate) {
        const data = await this.transactionService.getLedger(tenantId, productId, { locationId, startDate, endDate });
        return api_response_1.ApiResponse.success(data);
    }
    async getTransactionsBySerial(tenantId, serialId) {
        const data = await this.transactionService.getBySerial(tenantId, serialId);
        return api_response_1.ApiResponse.success(data);
    }
    async transfer(tenantId, userId, dto) {
        const data = await this.transactionService.transfer(tenantId, { ...dto, createdById: userId });
        return api_response_1.ApiResponse.success(data, 'Transfer completed');
    }
    async getStock(tenantId, productId, locationId) {
        const data = await this.inventoryService.getStockSummary(tenantId, { productId, locationId });
        return api_response_1.ApiResponse.success(data);
    }
    async getOpeningBalance(tenantId, productId, date) {
        const data = await this.inventoryService.getOpeningBalance(tenantId, productId, new Date(date));
        return api_response_1.ApiResponse.success(data);
    }
    async recalculateStock(tenantId, productId) {
        const data = await this.inventoryService.recalculateStock(tenantId, productId);
        return api_response_1.ApiResponse.success(data, 'Stock recalculated');
    }
    async listLocations(tenantId) {
        const data = await this.locationService.list(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createLocation(tenantId, dto) {
        const data = await this.locationService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Location created');
    }
    async updateLocation(tenantId, id, dto) {
        const data = await this.locationService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Location updated');
    }
    async stockLedgerReport(tenantId, productId, locationId, startDate, endDate) {
        const data = await this.reportService.stockLedger(tenantId, { productId, locationId, startDate, endDate });
        return api_response_1.ApiResponse.success(data);
    }
    async expiryReport(tenantId, days) {
        const data = await this.reportService.expiryReport(tenantId, days ? parseInt(days) : 30);
        return api_response_1.ApiResponse.success(data);
    }
    async valuationReport(tenantId, locationId) {
        const data = await this.reportService.valuation(tenantId, { locationId });
        return api_response_1.ApiResponse.success(data);
    }
    async serialTrackingReport(tenantId, serialNo, productId, status) {
        const data = await this.reportService.serialTracking(tenantId, { serialNo, productId, status });
        return api_response_1.ApiResponse.success(data);
    }
    async createAdjustment(tenantId, userId, dto) {
        const data = await this.adjustmentService.create(tenantId, { ...dto, createdById: userId });
        return api_response_1.ApiResponse.success(data, 'Adjustment created');
    }
    async approveAdjustment(tenantId, userId, id, dto) {
        const data = await this.adjustmentService.approve(tenantId, id, userId, dto.action);
        return api_response_1.ApiResponse.success(data, `Adjustment ${dto.action}d`);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventory dashboard KPIs' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('serials'),
    (0, swagger_1.ApiOperation)({ summary: 'List serial numbers' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('locationId')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listSerials", null);
__decorate([
    (0, common_1.Get)('serials/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search serials by number/code' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "searchSerials", null);
__decorate([
    (0, common_1.Get)('serials/expiring'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expiring serials' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getExpiringSerials", null);
__decorate([
    (0, common_1.Get)('serials/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get serial detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getSerial", null);
__decorate([
    (0, common_1.Post)('serials'),
    (0, swagger_1.ApiOperation)({ summary: 'Create serial number' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.CreateSerialDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createSerial", null);
__decorate([
    (0, common_1.Post)('serials/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create serial numbers' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.BulkCreateSerialDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "bulkCreateSerials", null);
__decorate([
    (0, common_1.Patch)('serials/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update serial' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.UpdateSerialDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateSerial", null);
__decorate([
    (0, common_1.Patch)('serials/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Change serial status' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.ChangeStatusDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "changeSerialStatus", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Record stock transaction' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.RecordTransactionDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "recordTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'List transactions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('transactionType')),
    __param(3, (0, common_1.Query)('locationId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/ledger/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock ledger for product' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('locationId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getStockLedger", null);
__decorate([
    (0, common_1.Get)('transactions/by-serial/:serialId'),
    (0, swagger_1.ApiOperation)({ summary: 'Transactions for a serial' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('serialId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getTransactionsBySerial", null);
__decorate([
    (0, common_1.Post)('transactions/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer stock between locations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.TransferDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Current stock summary' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('stock/opening-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Opening balance as of date' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getOpeningBalance", null);
__decorate([
    (0, common_1.Post)('stock/recalculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate stock from transactions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "recalculateStock", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'List stock locations' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create stock location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.CreateLocationDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Patch)('locations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stock location' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Get)('reports/stock-ledger'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock ledger report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('locationId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "stockLedgerReport", null);
__decorate([
    (0, common_1.Get)('reports/expiry'),
    (0, swagger_1.ApiOperation)({ summary: 'Expiry report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "expiryReport", null);
__decorate([
    (0, common_1.Get)('reports/valuation'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock valuation report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "valuationReport", null);
__decorate([
    (0, common_1.Get)('reports/serial-tracking'),
    (0, swagger_1.ApiOperation)({ summary: 'Serial tracking report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('serialNo')),
    __param(2, (0, common_1.Query)('productId')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "serialTrackingReport", null);
__decorate([
    (0, common_1.Post)('adjustments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create stock adjustment' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventory_dto_1.CreateAdjustmentDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createAdjustment", null);
__decorate([
    (0, common_1.Patch)('adjustments/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve/reject adjustment' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, inventory_dto_1.ApproveAdjustmentDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "approveAdjustment", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService,
        serial_service_1.SerialService,
        transaction_service_1.TransactionService,
        location_service_1.LocationService,
        adjustment_service_1.AdjustmentService,
        report_service_1.InventoryReportService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map