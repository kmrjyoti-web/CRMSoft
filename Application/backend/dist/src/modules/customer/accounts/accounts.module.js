"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsModule = void 0;
const common_1 = require("@nestjs/common");
const accounts_controller_1 = require("./presentation/accounts.controller");
const payment_record_service_1 = require("./services/payment-record.service");
const gst_return_service_1 = require("./services/gst-return.service");
const financial_report_service_1 = require("./services/financial-report.service");
const bank_service_1 = require("./services/bank.service");
const tds_service_1 = require("./services/tds.service");
const ledger_service_1 = require("./services/ledger.service");
const account_dashboard_service_1 = require("./services/account-dashboard.service");
const account_group_service_1 = require("./services/account-group.service");
const sale_master_service_1 = require("./services/sale-master.service");
const purchase_master_service_1 = require("./services/purchase-master.service");
let AccountsModule = class AccountsModule {
};
exports.AccountsModule = AccountsModule;
exports.AccountsModule = AccountsModule = __decorate([
    (0, common_1.Module)({
        controllers: [accounts_controller_1.AccountsController],
        providers: [
            payment_record_service_1.PaymentRecordService,
            gst_return_service_1.GSTReturnService,
            financial_report_service_1.FinancialReportService,
            bank_service_1.BankService,
            tds_service_1.TDSService,
            ledger_service_1.AccountLedgerService,
            account_dashboard_service_1.AccountDashboardService,
            account_group_service_1.AccountGroupService,
            sale_master_service_1.SaleMasterService,
            purchase_master_service_1.PurchaseMasterService,
        ],
        exports: [payment_record_service_1.PaymentRecordService, ledger_service_1.AccountLedgerService, sale_master_service_1.SaleMasterService, purchase_master_service_1.PurchaseMasterService],
    })
], AccountsModule);
//# sourceMappingURL=accounts.module.js.map