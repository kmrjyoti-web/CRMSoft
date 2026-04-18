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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const payment_record_service_1 = require("../services/payment-record.service");
const gst_return_service_1 = require("../services/gst-return.service");
const financial_report_service_1 = require("../services/financial-report.service");
const bank_service_1 = require("../services/bank.service");
const tds_service_1 = require("../services/tds.service");
const ledger_service_1 = require("../services/ledger.service");
const account_dashboard_service_1 = require("../services/account-dashboard.service");
const account_group_service_1 = require("../services/account-group.service");
const sale_master_service_1 = require("../services/sale-master.service");
const purchase_master_service_1 = require("../services/purchase-master.service");
const accounts_dto_1 = require("./dto/accounts.dto");
let AccountsController = class AccountsController {
    constructor(paymentService, gstService, reportService, bankService, tdsService, ledgerService, dashboardService, accountGroupService, saleMasterService, purchaseMasterService) {
        this.paymentService = paymentService;
        this.gstService = gstService;
        this.reportService = reportService;
        this.bankService = bankService;
        this.tdsService = tdsService;
        this.ledgerService = ledgerService;
        this.dashboardService = dashboardService;
        this.accountGroupService = accountGroupService;
        this.saleMasterService = saleMasterService;
        this.purchaseMasterService = purchaseMasterService;
    }
    async getDashboard(tenantId) {
        const data = await this.dashboardService.getDashboard(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async listPayments(tenantId, type, status, from, to) {
        const data = await this.paymentService.findAll(tenantId, { paymentType: type, status, startDate: from, endDate: to });
        return api_response_1.ApiResponse.success(data);
    }
    async pendingPayments(tenantId) {
        const data = await this.paymentService.getPending(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async overduePayments(tenantId) {
        const data = await this.paymentService.getOverdue(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getPayment(tenantId, id) {
        const data = await this.paymentService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createPayment(tenantId, userId, dto) {
        const data = await this.paymentService.create(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Payment created');
    }
    async approvePayment(tenantId, userId, id, dto) {
        const data = await this.paymentService.approve(tenantId, userId, id);
        return api_response_1.ApiResponse.success(data, 'Payment approved');
    }
    async cancelPayment(tenantId, id) {
        const data = await this.paymentService.cancel(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Payment cancelled');
    }
    async listBanks(tenantId) {
        const data = await this.bankService.listBankAccounts(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createBank(tenantId, dto) {
        const data = await this.bankService.createBankAccount(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Bank account added');
    }
    async getReconciliation(tenantId, id) {
        const data = await this.bankService.getReconciliation(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async submitReconciliation(tenantId, userId, dto) {
        const data = await this.bankService.submitReconciliation(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Reconciliation submitted');
    }
    async listGST(tenantId) {
        const data = await this.gstService.findAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getITC(tenantId, period) {
        const data = await this.gstService.getInputTaxCredit(tenantId, period);
        return api_response_1.ApiResponse.success(data);
    }
    async getGSTReturn(tenantId, id) {
        const data = await this.gstService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async generateGSTR1(tenantId, dto) {
        const data = await this.gstService.generateGSTR1(tenantId, dto.period);
        return api_response_1.ApiResponse.success(data, 'GSTR-1 generated');
    }
    async generateGSTR3B(tenantId, dto) {
        const data = await this.gstService.generateGSTR3B(tenantId, dto.period);
        return api_response_1.ApiResponse.success(data, 'GSTR-3B generated');
    }
    async fileGST(tenantId, userId, id, dto) {
        const data = await this.gstService.markFiled(tenantId, id, userId, dto.acknowledgementNo);
        return api_response_1.ApiResponse.success(data, 'GST return marked as filed');
    }
    async listTDS(tenantId, section, financialYear, quarter, status) {
        const data = await this.tdsService.findAll(tenantId, { section, financialYear, quarter, status });
        return api_response_1.ApiResponse.success(data);
    }
    async tdsSummary(tenantId, financialYear) {
        const data = await this.tdsService.getSummary(tenantId, financialYear);
        return api_response_1.ApiResponse.success(data);
    }
    async depositTDS(tenantId, id, dto) {
        const data = await this.tdsService.markDeposited(tenantId, id, dto.depositDate, dto.challanNumber);
        return api_response_1.ApiResponse.success(data, 'TDS marked as deposited');
    }
    async getGroupTree(tenantId) {
        const data = await this.accountGroupService.getTree(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getGroupFlat(tenantId) {
        const data = await this.accountGroupService.getAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getGroupById(tenantId, id) {
        const data = await this.accountGroupService.getById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createGroup(tenantId, dto) {
        const data = await this.accountGroupService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Account group created');
    }
    async updateGroup(tenantId, id, dto) {
        const data = await this.accountGroupService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Account group updated');
    }
    async deleteGroup(tenantId, id) {
        const data = await this.accountGroupService.delete(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Account group deleted');
    }
    async listSaleMasters(tenantId) {
        const data = await this.saleMasterService.findAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createSaleMaster(tenantId, dto) {
        const data = await this.saleMasterService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Sale master created');
    }
    async updateSaleMaster(tenantId, id, dto) {
        const data = await this.saleMasterService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Sale master updated');
    }
    async deleteSaleMaster(tenantId, id) {
        const data = await this.saleMasterService.delete(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Sale master deleted');
    }
    async listPurchaseMasters(tenantId) {
        const data = await this.purchaseMasterService.findAll(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createPurchaseMaster(tenantId, dto) {
        const data = await this.purchaseMasterService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Purchase master created');
    }
    async updatePurchaseMaster(tenantId, id, dto) {
        const data = await this.purchaseMasterService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Purchase master updated');
    }
    async deletePurchaseMaster(tenantId, id) {
        const data = await this.purchaseMasterService.delete(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Purchase master deleted');
    }
    async chartOfAccounts(tenantId) {
        const data = await this.ledgerService.getChartOfAccounts(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getUnmappedEntities(tenantId) {
        const data = await this.ledgerService.getUnmappedEntities(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async listLedgers(tenantId, search, groupType, station, page, limit) {
        const data = await this.ledgerService.listLedgers(tenantId, {
            search,
            groupType,
            station,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
        return api_response_1.ApiResponse.success(data);
    }
    async getLedgerById(tenantId, id) {
        const data = await this.ledgerService.getLedgerById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async createLedger(tenantId, dto) {
        const data = await this.ledgerService.createLedger(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Ledger created');
    }
    async updateLedger(tenantId, id, dto) {
        const data = await this.ledgerService.updateLedger(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Ledger updated');
    }
    async deactivateLedger(tenantId, id) {
        const data = await this.ledgerService.deactivateLedger(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Ledger deactivated');
    }
    async getLedgerStatement(tenantId, id, from, to) {
        const data = await this.ledgerService.getLedgerStatement(id, tenantId, from, to);
        return api_response_1.ApiResponse.success(data);
    }
    async getLedgerEntities(tenantId, id) {
        const data = await this.ledgerService.getLedgerEntities(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async getLedgerMappings(tenantId) {
        const data = await this.ledgerService.getLedgerMappings(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createLedgerMapping(tenantId, dto) {
        const data = await this.ledgerService.createLedgerMapping(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Ledger mapping saved');
    }
    async bulkCreateMappings(tenantId, dto) {
        const data = await this.ledgerService.bulkCreateMappings(tenantId, dto.mappings);
        return api_response_1.ApiResponse.success(data, 'Bulk mappings created');
    }
    async tallyImportLedgers(tenantId, body) {
        const data = await this.ledgerService.bulkImportFromTally(tenantId, body.ledgers ?? []);
        return api_response_1.ApiResponse.success(data, `Tally import complete: ${data.created} created, ${data.skipped} skipped`);
    }
    async createJournalEntry(tenantId, userId, dto) {
        const data = await this.ledgerService.createJournalEntry(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Journal entry created');
    }
    async profitLoss(tenantId, from, to) {
        const data = await this.reportService.getProfitAndLoss(tenantId, from, to);
        return api_response_1.ApiResponse.success(data);
    }
    async balanceSheet(tenantId, asOfDate) {
        const data = await this.reportService.getBalanceSheet(tenantId, asOfDate);
        return api_response_1.ApiResponse.success(data);
    }
    async trialBalance(tenantId, from, to) {
        const data = await this.reportService.getTrialBalance(tenantId, from, to);
        return api_response_1.ApiResponse.success(data);
    }
    async cashFlow(tenantId, from, to) {
        const data = await this.reportService.getCashFlow(tenantId, from, to);
        return api_response_1.ApiResponse.success(data);
    }
    async receivableAging(tenantId) {
        const data = await this.reportService.getReceivableAging(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async payableAging(tenantId) {
        const data = await this.reportService.getPayableAging(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async dayBook(tenantId, date) {
        const data = await this.reportService.getDayBook(tenantId, date);
        return api_response_1.ApiResponse.success(data);
    }
    async ledgerStatement(tenantId, ledgerId, from, to) {
        const data = await this.reportService.getLedgerStatement(tenantId, ledgerId, from, to);
        return api_response_1.ApiResponse.success(data);
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Accounts dashboard' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'List payments' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listPayments", null);
__decorate([
    (0, common_1.Get)('payments/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Pending approval payments' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "pendingPayments", null);
__decorate([
    (0, common_1.Get)('payments/overdue'),
    (0, swagger_1.ApiOperation)({ summary: 'Overdue payments' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "overduePayments", null);
__decorate([
    (0, common_1.Get)('payments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Payment detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Patch)('payments/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve payment' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, accounts_dto_1.ApprovePaymentDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Patch)('payments/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel payment' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "cancelPayment", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, swagger_1.ApiOperation)({ summary: 'List bank accounts' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listBanks", null);
__decorate([
    (0, common_1.Post)('banks'),
    (0, swagger_1.ApiOperation)({ summary: 'Add bank account' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreateBankAccountDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createBank", null);
__decorate([
    (0, common_1.Get)('banks/:id/reconciliation'),
    (0, swagger_1.ApiOperation)({ summary: 'Bank reconciliation data' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getReconciliation", null);
__decorate([
    (0, common_1.Post)('banks/reconciliation'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit bank reconciliation' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.SubmitReconciliationDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "submitReconciliation", null);
__decorate([
    (0, common_1.Get)('gst'),
    (0, swagger_1.ApiOperation)({ summary: 'List GST returns' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listGST", null);
__decorate([
    (0, common_1.Get)('gst/itc'),
    (0, swagger_1.ApiOperation)({ summary: 'Input Tax Credit summary' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getITC", null);
__decorate([
    (0, common_1.Get)('gst/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'GST return detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getGSTReturn", null);
__decorate([
    (0, common_1.Post)('gst/generate-gstr1'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate GSTR-1' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.GenerateGSTDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "generateGSTR1", null);
__decorate([
    (0, common_1.Post)('gst/generate-gstr3b'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate GSTR-3B' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.GenerateGSTDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "generateGSTR3B", null);
__decorate([
    (0, common_1.Patch)('gst/:id/file'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark GST return as filed' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, accounts_dto_1.FileGSTDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "fileGST", null);
__decorate([
    (0, common_1.Get)('tds'),
    (0, swagger_1.ApiOperation)({ summary: 'List TDS records' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('section')),
    __param(2, (0, common_1.Query)('financialYear')),
    __param(3, (0, common_1.Query)('quarter')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listTDS", null);
__decorate([
    (0, common_1.Get)('tds/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'TDS summary by section and quarter' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('financialYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "tdsSummary", null);
__decorate([
    (0, common_1.Patch)('tds/:id/deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark TDS as deposited' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.DepositTDSDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "depositTDS", null);
__decorate([
    (0, common_1.Get)('groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Account groups tree' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getGroupTree", null);
__decorate([
    (0, common_1.Get)('groups/flat'),
    (0, swagger_1.ApiOperation)({ summary: 'Account groups flat list' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getGroupFlat", null);
__decorate([
    (0, common_1.Get)('groups/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Account group detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getGroupById", null);
__decorate([
    (0, common_1.Post)('groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Create account group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreateAccountGroupDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Patch)('groups/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.UpdateAccountGroupDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete account group' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Get)('sale-master'),
    (0, swagger_1.ApiOperation)({ summary: 'List sale masters' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listSaleMasters", null);
__decorate([
    (0, common_1.Post)('sale-master'),
    (0, swagger_1.ApiOperation)({ summary: 'Create sale master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreateSaleMasterDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createSaleMaster", null);
__decorate([
    (0, common_1.Patch)('sale-master/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.UpdateSaleMasterDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "updateSaleMaster", null);
__decorate([
    (0, common_1.Delete)('sale-master/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete sale master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "deleteSaleMaster", null);
__decorate([
    (0, common_1.Get)('purchase-master'),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase masters' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listPurchaseMasters", null);
__decorate([
    (0, common_1.Post)('purchase-master'),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreatePurchaseMasterDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createPurchaseMaster", null);
__decorate([
    (0, common_1.Patch)('purchase-master/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.UpdatePurchaseMasterDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "updatePurchaseMaster", null);
__decorate([
    (0, common_1.Delete)('purchase-master/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete purchase master' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "deletePurchaseMaster", null);
__decorate([
    (0, common_1.Get)('ledgers/tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Chart of accounts (grouped tree)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "chartOfAccounts", null);
__decorate([
    (0, common_1.Get)('ledgers/mappings/unmapped'),
    (0, swagger_1.ApiOperation)({ summary: 'Unmapped entities (orgs and contacts without ledger)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getUnmappedEntities", null);
__decorate([
    (0, common_1.Get)('ledgers'),
    (0, swagger_1.ApiOperation)({ summary: 'List ledgers with search/filter/pagination' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('groupType')),
    __param(3, (0, common_1.Query)('station')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "listLedgers", null);
__decorate([
    (0, common_1.Get)('ledgers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Ledger detail with recent transactions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getLedgerById", null);
__decorate([
    (0, common_1.Post)('ledgers'),
    (0, swagger_1.ApiOperation)({ summary: 'Create ledger (rich form)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreateRichLedgerDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createLedger", null);
__decorate([
    (0, common_1.Patch)('ledgers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ledger' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "updateLedger", null);
__decorate([
    (0, common_1.Post)('ledgers/:id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate ledger (zero-balance only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "deactivateLedger", null);
__decorate([
    (0, common_1.Get)('ledgers/:id/statement'),
    (0, swagger_1.ApiOperation)({ summary: 'Ledger statement for a date range' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getLedgerStatement", null);
__decorate([
    (0, common_1.Get)('ledgers/:id/entities'),
    (0, swagger_1.ApiOperation)({ summary: 'Entities mapped to a ledger' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getLedgerEntities", null);
__decorate([
    (0, common_1.Get)('ledger-mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'List all ledger mappings' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getLedgerMappings", null);
__decorate([
    (0, common_1.Post)('ledger-mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update a ledger mapping' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.CreateLedgerMappingDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createLedgerMapping", null);
__decorate([
    (0, common_1.Post)('ledger-mappings/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create ledger mappings' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounts_dto_1.BulkCreateMappingsDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "bulkCreateMappings", null);
__decorate([
    (0, common_1.Post)('ledgers/tally-import'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk import ledgers from Tally XML export (parsed array)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "tallyImportLedgers", null);
__decorate([
    (0, common_1.Post)('journal-entries'),
    (0, swagger_1.ApiOperation)({ summary: 'Create journal entry' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, accounts_dto_1.CreateJournalEntryDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "createJournalEntry", null);
__decorate([
    (0, common_1.Get)('reports/profit-loss'),
    (0, swagger_1.ApiOperation)({ summary: 'Profit & Loss statement' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "profitLoss", null);
__decorate([
    (0, common_1.Get)('reports/balance-sheet'),
    (0, swagger_1.ApiOperation)({ summary: 'Balance Sheet' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "balanceSheet", null);
__decorate([
    (0, common_1.Get)('reports/trial-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Trial Balance' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "trialBalance", null);
__decorate([
    (0, common_1.Get)('reports/cash-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Cash Flow statement' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "cashFlow", null);
__decorate([
    (0, common_1.Get)('reports/receivable-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Receivable aging report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "receivableAging", null);
__decorate([
    (0, common_1.Get)('reports/payable-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Payable aging report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "payableAging", null);
__decorate([
    (0, common_1.Get)('reports/day-book'),
    (0, swagger_1.ApiOperation)({ summary: 'Day book' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "dayBook", null);
__decorate([
    (0, common_1.Get)('reports/ledger-statement/:ledgerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Ledger statement (via reports)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('accounts:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('ledgerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "ledgerStatement", null);
exports.AccountsController = AccountsController = __decorate([
    (0, swagger_1.ApiTags)('Accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('accounts'),
    __metadata("design:paramtypes", [payment_record_service_1.PaymentRecordService,
        gst_return_service_1.GSTReturnService,
        financial_report_service_1.FinancialReportService,
        bank_service_1.BankService,
        tds_service_1.TDSService,
        ledger_service_1.AccountLedgerService,
        account_dashboard_service_1.AccountDashboardService,
        account_group_service_1.AccountGroupService,
        sale_master_service_1.SaleMasterService,
        purchase_master_service_1.PurchaseMasterService])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map