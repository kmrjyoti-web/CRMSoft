import { Module } from '@nestjs/common';
import { AccountsController } from './presentation/accounts.controller';
import { PaymentRecordService } from './services/payment-record.service';
import { GSTReturnService } from './services/gst-return.service';
import { FinancialReportService } from './services/financial-report.service';
import { BankService } from './services/bank.service';
import { TDSService } from './services/tds.service';
import { AccountLedgerService } from './services/ledger.service';
import { AccountDashboardService } from './services/account-dashboard.service';
import { AccountGroupService } from './services/account-group.service';
import { SaleMasterService } from './services/sale-master.service';
import { PurchaseMasterService } from './services/purchase-master.service';

@Module({
  controllers: [AccountsController],
  providers: [
    PaymentRecordService,
    GSTReturnService,
    FinancialReportService,
    BankService,
    TDSService,
    AccountLedgerService,
    AccountDashboardService,
    AccountGroupService,
    SaleMasterService,
    PurchaseMasterService,
  ],
  exports: [PaymentRecordService, AccountLedgerService, SaleMasterService, PurchaseMasterService],
})
export class AccountsModule {}
