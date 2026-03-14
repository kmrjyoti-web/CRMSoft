import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { PaymentRecordService } from '../services/payment-record.service';
import { GSTReturnService } from '../services/gst-return.service';
import { FinancialReportService } from '../services/financial-report.service';
import { BankService } from '../services/bank.service';
import { TDSService } from '../services/tds.service';
import { AccountLedgerService } from '../services/ledger.service';
import { AccountDashboardService } from '../services/account-dashboard.service';
import { AccountGroupService } from '../services/account-group.service';
import { SaleMasterService } from '../services/sale-master.service';
import { PurchaseMasterService } from '../services/purchase-master.service';
import {
  CreatePaymentDto, ApprovePaymentDto, CreateBankAccountDto,
  SubmitReconciliationDto, GenerateGSTDto, FileGSTDto,
  DepositTDSDto, CreateJournalEntryDto, CreateLedgerDto,
  CreateAccountGroupDto, UpdateAccountGroupDto,
  CreateSaleMasterDto, UpdateSaleMasterDto,
  CreatePurchaseMasterDto, UpdatePurchaseMasterDto,
  CreateRichLedgerDto, CreateLedgerMappingDto, BulkCreateMappingsDto,
} from './dto/accounts.dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly paymentService: PaymentRecordService,
    private readonly gstService: GSTReturnService,
    private readonly reportService: FinancialReportService,
    private readonly bankService: BankService,
    private readonly tdsService: TDSService,
    private readonly ledgerService: AccountLedgerService,
    private readonly dashboardService: AccountDashboardService,
    private readonly accountGroupService: AccountGroupService,
    private readonly saleMasterService: SaleMasterService,
    private readonly purchaseMasterService: PurchaseMasterService,
  ) {}

  // ─── DASHBOARD ───

  @Get('dashboard')
  @ApiOperation({ summary: 'Accounts dashboard' })
  @RequirePermissions('accounts:read')
  async getDashboard(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.dashboardService.getDashboard(tenantId);
    return ApiResponse.success(data);
  }

  // ─── PAYMENTS ───

  @Get('payments')
  @ApiOperation({ summary: 'List payments' })
  @RequirePermissions('accounts:read')
  async listPayments(
    @CurrentUser('tenantId') tenantId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.paymentService.findAll(tenantId, { paymentType: type, status, startDate: from, endDate: to });
    return ApiResponse.success(data);
  }

  @Get('payments/pending')
  @ApiOperation({ summary: 'Pending approval payments' })
  @RequirePermissions('accounts:read')
  async pendingPayments(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.paymentService.getPending(tenantId);
    return ApiResponse.success(data);
  }

  @Get('payments/overdue')
  @ApiOperation({ summary: 'Overdue payments' })
  @RequirePermissions('accounts:read')
  async overduePayments(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.paymentService.getOverdue(tenantId);
    return ApiResponse.success(data);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Payment detail' })
  @RequirePermissions('accounts:read')
  async getPayment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.paymentService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create payment' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    const data = await this.paymentService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Payment created');
  }

  @Patch('payments/:id/approve')
  @ApiOperation({ summary: 'Approve payment' })
  @RequirePermissions('accounts:approve')
  async approvePayment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovePaymentDto,
  ) {
    const data = await this.paymentService.approve(tenantId, userId, id);
    return ApiResponse.success(data, 'Payment approved');
  }

  @Patch('payments/:id/cancel')
  @ApiOperation({ summary: 'Cancel payment' })
  @RequirePermissions('accounts:delete')
  async cancelPayment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.paymentService.cancel(tenantId, id);
    return ApiResponse.success(data, 'Payment cancelled');
  }

  // ─── BANK ACCOUNTS ───

  @Get('banks')
  @ApiOperation({ summary: 'List bank accounts' })
  @RequirePermissions('accounts:read')
  async listBanks(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.bankService.listBankAccounts(tenantId);
    return ApiResponse.success(data);
  }

  @Post('banks')
  @ApiOperation({ summary: 'Add bank account' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createBank(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateBankAccountDto,
  ) {
    const data = await this.bankService.createBankAccount(tenantId, dto);
    return ApiResponse.success(data, 'Bank account added');
  }

  @Get('banks/:id/reconciliation')
  @ApiOperation({ summary: 'Bank reconciliation data' })
  @RequirePermissions('accounts:read')
  async getReconciliation(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.bankService.getReconciliation(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('banks/reconciliation')
  @ApiOperation({ summary: 'Submit bank reconciliation' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async submitReconciliation(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: SubmitReconciliationDto,
  ) {
    const data = await this.bankService.submitReconciliation(tenantId, userId, dto);
    return ApiResponse.success(data, 'Reconciliation submitted');
  }

  // ─── GST ───

  @Get('gst')
  @ApiOperation({ summary: 'List GST returns' })
  @RequirePermissions('accounts:read')
  async listGST(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const data = await this.gstService.findAll(tenantId);
    return ApiResponse.success(data);
  }

  @Get('gst/itc')
  @ApiOperation({ summary: 'Input Tax Credit summary' })
  @RequirePermissions('accounts:read')
  async getITC(
    @CurrentUser('tenantId') tenantId: string,
    @Query('period') period: string,
  ) {
    const data = await this.gstService.getInputTaxCredit(tenantId, period);
    return ApiResponse.success(data);
  }

  @Get('gst/:id')
  @ApiOperation({ summary: 'GST return detail' })
  @RequirePermissions('accounts:read')
  async getGSTReturn(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.gstService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('gst/generate-gstr1')
  @ApiOperation({ summary: 'Generate GSTR-1' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async generateGSTR1(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: GenerateGSTDto,
  ) {
    const data = await this.gstService.generateGSTR1(tenantId, dto.period);
    return ApiResponse.success(data, 'GSTR-1 generated');
  }

  @Post('gst/generate-gstr3b')
  @ApiOperation({ summary: 'Generate GSTR-3B' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async generateGSTR3B(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: GenerateGSTDto,
  ) {
    const data = await this.gstService.generateGSTR3B(tenantId, dto.period);
    return ApiResponse.success(data, 'GSTR-3B generated');
  }

  @Patch('gst/:id/file')
  @ApiOperation({ summary: 'Mark GST return as filed' })
  @RequirePermissions('accounts:approve')
  async fileGST(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FileGSTDto,
  ) {
    const data = await this.gstService.markFiled(tenantId, id, userId, dto.acknowledgementNo);
    return ApiResponse.success(data, 'GST return marked as filed');
  }

  // ─── TDS ───

  @Get('tds')
  @ApiOperation({ summary: 'List TDS records' })
  @RequirePermissions('accounts:read')
  async listTDS(
    @CurrentUser('tenantId') tenantId: string,
    @Query('section') section?: string,
    @Query('financialYear') financialYear?: string,
    @Query('quarter') quarter?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.tdsService.findAll(tenantId, { section, financialYear, quarter, status });
    return ApiResponse.success(data);
  }

  @Get('tds/summary')
  @ApiOperation({ summary: 'TDS summary by section and quarter' })
  @RequirePermissions('accounts:read')
  async tdsSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('financialYear') financialYear?: string,
  ) {
    const data = await this.tdsService.getSummary(tenantId, financialYear);
    return ApiResponse.success(data);
  }

  @Patch('tds/:id/deposit')
  @ApiOperation({ summary: 'Mark TDS as deposited' })
  @RequirePermissions('accounts:approve')
  async depositTDS(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DepositTDSDto,
  ) {
    const data = await this.tdsService.markDeposited(tenantId, id, dto.depositDate, dto.challanNumber);
    return ApiResponse.success(data, 'TDS marked as deposited');
  }

  // ─── ACCOUNT GROUPS ───

  @Get('groups')
  @ApiOperation({ summary: 'Account groups tree' })
  @RequirePermissions('accounts:read')
  async getGroupTree(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.accountGroupService.getTree(tenantId);
    return ApiResponse.success(data);
  }

  @Get('groups/flat')
  @ApiOperation({ summary: 'Account groups flat list' })
  @RequirePermissions('accounts:read')
  async getGroupFlat(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.accountGroupService.getAll(tenantId);
    return ApiResponse.success(data);
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Account group detail' })
  @RequirePermissions('accounts:read')
  async getGroupById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.accountGroupService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create account group' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateAccountGroupDto,
  ) {
    const data = await this.accountGroupService.create(tenantId, dto);
    return ApiResponse.success(data, 'Account group created');
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update account group' })
  @RequirePermissions('accounts:create')
  async updateGroup(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountGroupDto,
  ) {
    const data = await this.accountGroupService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Account group updated');
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete account group' })
  @RequirePermissions('accounts:delete')
  async deleteGroup(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.accountGroupService.delete(tenantId, id);
    return ApiResponse.success(data, 'Account group deleted');
  }

  // ─── SALE MASTER ───

  @Get('sale-master')
  @ApiOperation({ summary: 'List sale masters' })
  @RequirePermissions('accounts:read')
  async listSaleMasters(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.saleMasterService.findAll(tenantId);
    return ApiResponse.success(data);
  }

  @Post('sale-master')
  @ApiOperation({ summary: 'Create sale master' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createSaleMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSaleMasterDto,
  ) {
    const data = await this.saleMasterService.create(tenantId, dto);
    return ApiResponse.success(data, 'Sale master created');
  }

  @Patch('sale-master/:id')
  @ApiOperation({ summary: 'Update sale master' })
  @RequirePermissions('accounts:create')
  async updateSaleMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSaleMasterDto,
  ) {
    const data = await this.saleMasterService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Sale master updated');
  }

  @Delete('sale-master/:id')
  @ApiOperation({ summary: 'Delete sale master' })
  @RequirePermissions('accounts:delete')
  async deleteSaleMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleMasterService.delete(tenantId, id);
    return ApiResponse.success(data, 'Sale master deleted');
  }

  // ─── PURCHASE MASTER ───

  @Get('purchase-master')
  @ApiOperation({ summary: 'List purchase masters' })
  @RequirePermissions('accounts:read')
  async listPurchaseMasters(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.purchaseMasterService.findAll(tenantId);
    return ApiResponse.success(data);
  }

  @Post('purchase-master')
  @ApiOperation({ summary: 'Create purchase master' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createPurchaseMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePurchaseMasterDto,
  ) {
    const data = await this.purchaseMasterService.create(tenantId, dto);
    return ApiResponse.success(data, 'Purchase master created');
  }

  @Patch('purchase-master/:id')
  @ApiOperation({ summary: 'Update purchase master' })
  @RequirePermissions('accounts:create')
  async updatePurchaseMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseMasterDto,
  ) {
    const data = await this.purchaseMasterService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Purchase master updated');
  }

  @Delete('purchase-master/:id')
  @ApiOperation({ summary: 'Delete purchase master' })
  @RequirePermissions('accounts:delete')
  async deletePurchaseMaster(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.purchaseMasterService.delete(tenantId, id);
    return ApiResponse.success(data, 'Purchase master deleted');
  }

  // ─── LEDGER / CHART OF ACCOUNTS ───

  @Get('ledgers/tree')
  @ApiOperation({ summary: 'Chart of accounts (grouped tree)' })
  @RequirePermissions('accounts:read')
  async chartOfAccounts(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.ledgerService.getChartOfAccounts(tenantId);
    return ApiResponse.success(data);
  }

  @Get('ledgers/mappings/unmapped')
  @ApiOperation({ summary: 'Unmapped entities (orgs and contacts without ledger)' })
  @RequirePermissions('accounts:read')
  async getUnmappedEntities(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.ledgerService.getUnmappedEntities(tenantId);
    return ApiResponse.success(data);
  }

  @Get('ledgers')
  @ApiOperation({ summary: 'List ledgers with search/filter/pagination' })
  @RequirePermissions('accounts:read')
  async listLedgers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('groupType') groupType?: string,
    @Query('station') station?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.ledgerService.listLedgers(tenantId, {
      search,
      groupType,
      station,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return ApiResponse.success(data);
  }

  @Get('ledgers/:id')
  @ApiOperation({ summary: 'Ledger detail with recent transactions' })
  @RequirePermissions('accounts:read')
  async getLedgerById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ledgerService.getLedgerById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('ledgers')
  @ApiOperation({ summary: 'Create ledger (rich form)' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createLedger(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateRichLedgerDto,
  ) {
    const data = await this.ledgerService.createLedger(tenantId, dto);
    return ApiResponse.success(data, 'Ledger created');
  }

  @Patch('ledgers/:id')
  @ApiOperation({ summary: 'Update ledger' })
  @RequirePermissions('accounts:create')
  async updateLedger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateRichLedgerDto>,
  ) {
    const data = await this.ledgerService.updateLedger(tenantId, id, dto);
    return ApiResponse.success(data, 'Ledger updated');
  }

  @Post('ledgers/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate ledger (zero-balance only)' })
  @RequirePermissions('accounts:delete')
  @HttpCode(HttpStatus.OK)
  async deactivateLedger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ledgerService.deactivateLedger(tenantId, id);
    return ApiResponse.success(data, 'Ledger deactivated');
  }

  @Get('ledgers/:id/statement')
  @ApiOperation({ summary: 'Ledger statement for a date range' })
  @RequirePermissions('accounts:read')
  async getLedgerStatement(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.ledgerService.getLedgerStatement(id, tenantId, from, to);
    return ApiResponse.success(data);
  }

  @Get('ledgers/:id/entities')
  @ApiOperation({ summary: 'Entities mapped to a ledger' })
  @RequirePermissions('accounts:read')
  async getLedgerEntities(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.ledgerService.getLedgerEntities(tenantId, id);
    return ApiResponse.success(data);
  }

  // ─── LEDGER MAPPINGS ───

  @Get('ledger-mappings')
  @ApiOperation({ summary: 'List all ledger mappings' })
  @RequirePermissions('accounts:read')
  async getLedgerMappings(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.ledgerService.getLedgerMappings(tenantId);
    return ApiResponse.success(data);
  }

  @Post('ledger-mappings')
  @ApiOperation({ summary: 'Create or update a ledger mapping' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createLedgerMapping(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateLedgerMappingDto,
  ) {
    const data = await this.ledgerService.createLedgerMapping(tenantId, dto);
    return ApiResponse.success(data, 'Ledger mapping saved');
  }

  @Post('ledger-mappings/bulk')
  @ApiOperation({ summary: 'Bulk create ledger mappings' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateMappings(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: BulkCreateMappingsDto,
  ) {
    const data = await this.ledgerService.bulkCreateMappings(tenantId, dto.mappings);
    return ApiResponse.success(data, 'Bulk mappings created');
  }

  // ─── TALLY IMPORT ───

  @Post('ledgers/tally-import')
  @ApiOperation({ summary: 'Bulk import ledgers from Tally XML export (parsed array)' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async tallyImportLedgers(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { ledgers: any[] },
  ) {
    const data = await this.ledgerService.bulkImportFromTally(tenantId, body.ledgers ?? []);
    return ApiResponse.success(data, `Tally import complete: ${data.created} created, ${data.skipped} skipped`);
  }

  // ─── JOURNAL ENTRIES ───

  @Post('journal-entries')
  @ApiOperation({ summary: 'Create journal entry' })
  @RequirePermissions('accounts:create')
  @HttpCode(HttpStatus.CREATED)
  async createJournalEntry(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    const data = await this.ledgerService.createJournalEntry(tenantId, userId, dto);
    return ApiResponse.success(data, 'Journal entry created');
  }

  // ─── FINANCIAL REPORTS ───

  @Get('reports/profit-loss')
  @ApiOperation({ summary: 'Profit & Loss statement' })
  @RequirePermissions('accounts:read')
  async profitLoss(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.reportService.getProfitAndLoss(tenantId, from, to);
    return ApiResponse.success(data);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Balance Sheet' })
  @RequirePermissions('accounts:read')
  async balanceSheet(
    @CurrentUser('tenantId') tenantId: string,
    @Query('asOfDate') asOfDate: string,
  ) {
    const data = await this.reportService.getBalanceSheet(tenantId, asOfDate);
    return ApiResponse.success(data);
  }

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Trial Balance' })
  @RequirePermissions('accounts:read')
  async trialBalance(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.reportService.getTrialBalance(tenantId, from, to);
    return ApiResponse.success(data);
  }

  @Get('reports/cash-flow')
  @ApiOperation({ summary: 'Cash Flow statement' })
  @RequirePermissions('accounts:read')
  async cashFlow(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.reportService.getCashFlow(tenantId, from, to);
    return ApiResponse.success(data);
  }

  @Get('reports/receivable-aging')
  @ApiOperation({ summary: 'Receivable aging report' })
  @RequirePermissions('accounts:read')
  async receivableAging(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.reportService.getReceivableAging(tenantId);
    return ApiResponse.success(data);
  }

  @Get('reports/payable-aging')
  @ApiOperation({ summary: 'Payable aging report' })
  @RequirePermissions('accounts:read')
  async payableAging(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.reportService.getPayableAging(tenantId);
    return ApiResponse.success(data);
  }

  @Get('reports/day-book')
  @ApiOperation({ summary: 'Day book' })
  @RequirePermissions('accounts:read')
  async dayBook(
    @CurrentUser('tenantId') tenantId: string,
    @Query('date') date: string,
  ) {
    const data = await this.reportService.getDayBook(tenantId, date);
    return ApiResponse.success(data);
  }

  @Get('reports/ledger-statement/:ledgerId')
  @ApiOperation({ summary: 'Ledger statement (via reports)' })
  @RequirePermissions('accounts:read')
  async ledgerStatement(
    @CurrentUser('tenantId') tenantId: string,
    @Param('ledgerId', ParseUUIDPipe) ledgerId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.reportService.getLedgerStatement(tenantId, ledgerId, from, to);
    return ApiResponse.success(data);
  }
}
