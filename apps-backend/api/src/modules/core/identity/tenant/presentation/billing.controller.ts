import {
  Controller, Get, Post, Param, Body, Query, Headers,
  HttpCode, HttpStatus, RawBodyRequest, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecalculateUsageCommand } from '../application/commands/recalculate-usage/recalculate-usage.command';
import { ListInvoicesQuery } from '../application/queries/list-invoices/query';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpgradeOrderDto, ConfirmUpgradeDto } from './dto/upgrade.dto';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../../common/decorators/roles.decorator';
import { InvoiceGeneratorService } from '../services/invoice-generator.service';
import { TenantUpgradeService } from '../services/tenant-upgrade.service';
import { TenantDataMigrationService } from '../services/tenant-data-migration.service';
import { WlDbProvisioningService } from '../services/wl-db-provisioning.service';
import { ApiResponse } from '../../../../../common/utils/api-response';

const DB_STRATEGY_ORDER = ['PROVISIONING', 'DEDICATED', 'MIGRATING', 'SEEDING', 'DEDICATED', 'DEDICATED'];

function buildProvisioningSteps(
  dbStrategy: string,
  migration: ReturnType<TenantDataMigrationService['getMigrationProgress']>,
  startedAt: Date | null,
) {
  type StepStatus = 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';

  const strats = ['SHARED', 'PROVISIONING', 'DEDICATED', 'MIGRATING', 'SEEDING', 'DEDICATED'];
  const stratIdx = strats.indexOf(dbStrategy);

  function stepStatus(threshold: number): StepStatus {
    if (stratIdx > threshold) return 'COMPLETE';
    if (stratIdx === threshold) return 'IN_PROGRESS';
    return 'PENDING';
  }

  const migStatus = migration?.status ?? 'idle';

  return [
    { step: 'PAYMENT_RECEIVED',    status: 'COMPLETE' as StepStatus, label: 'Payment received' },
    { step: 'DB_CREATED',          status: stepStatus(1), label: 'Database created' },
    { step: 'SCHEMA_INITIALIZED',  status: stepStatus(2), label: 'Schema initialized' },
    {
      step: 'DATA_MIGRATION',
      status: (migStatus === 'complete' ? 'COMPLETE' : migStatus === 'running' ? 'IN_PROGRESS' : stepStatus(3)) as StepStatus,
      label: 'Migrating your data',
      progress: migration
        ? {
            totalTables: migration.tables.length,
            completedTables: migration.tables.filter((t) => t.status === 'complete').length,
            currentTable: migration.currentTable,
            totalRows: migration.totalRows,
            migratedRows: migration.migratedRows,
          }
        : undefined,
    },
    {
      step: 'ACTIVE',
      status: (dbStrategy === 'DEDICATED' && migStatus === 'complete' ? 'COMPLETE' : 'PENDING') as StepStatus,
      label: 'Account ready',
    },
  ];
}

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('tenant/billing')
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly invoiceGenerator: InvoiceGeneratorService,
    private readonly upgradeService: TenantUpgradeService,
    private readonly migrationService: TenantDataMigrationService,
    private readonly wlProvisioning: WlDbProvisioningService,
  ) {}

  // ─── Plan listing ──────────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List all available subscription plans' })
  async listPlans() {
    const plans = await this.upgradeService.listPlans();
    return ApiResponse.success(plans, 'Plans retrieved');
  }

  // ─── Upgrade flow ──────────────────────────────────────────────────────────

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Razorpay order for plan upgrade' })
  async createUpgradeOrder(
    @Body() dto: UpgradeOrderDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const order = await this.upgradeService.createOrder(tenantId, dto.packageCode, dto.billingCycle);
    return ApiResponse.success(order, 'Order created');
  }

  @Post('upgrade/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm Razorpay payment and activate plan' })
  async confirmUpgrade(
    @Body() dto: ConfirmUpgradeDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.upgradeService.confirmPayment(
      tenantId,
      dto.orderId,
      dto.paymentId,
      dto.signature,
      dto.packageCode,
      dto.billingCycle,
    );
    return ApiResponse.success(result, 'Plan upgraded successfully');
  }

  @Get('upgrade/status')
  @ApiOperation({ summary: 'Get current plan and upgrade status' })
  async getUpgradeStatus(@CurrentUser('tenantId') tenantId: string) {
    const status = await this.upgradeService.getStatus(tenantId);
    return ApiResponse.success(status, 'Status retrieved');
  }

  // ─── Provisioning progress ────────────────────────────────────────────────

  @Get('provisioning/status')
  @ApiOperation({ summary: 'Get dedicated DB provisioning + data migration progress' })
  async getProvisioningStatus(@CurrentUser('tenantId') tenantId: string) {
    const [provision, migration] = await Promise.all([
      this.wlProvisioning.getStatus(tenantId),
      Promise.resolve(this.migrationService.getMigrationProgress(tenantId)),
    ]);

    const steps = buildProvisioningSteps(provision.status, migration, provision.createdAt);
    const inProgress = steps.find((s) => s.status === 'IN_PROGRESS');
    const migProg = migration;
    const estimatedTimeRemaining = migProg?.status === 'running' && migProg.totalRows > 0
      ? Math.round(((migProg.totalRows - migProg.migratedRows) / Math.max(migProg.migratedRows, 1)) *
          ((Date.now() - (migProg.startedAt?.getTime() ?? Date.now())) / 1000))
      : null;

    return ApiResponse.success({
      tenantId,
      dbStrategy: provision.status,
      steps,
      currentStep: inProgress?.step ?? null,
      estimatedTimeRemaining,
      startedAt: provision.createdAt,
      canRollback: ['PROVISIONING', 'MIGRATING', 'SEEDING'].includes(provision.status),
    }, 'Provisioning status retrieved');
  }

  // ─── Razorpay webhook ─────────────────────────────────────────────────────

  @Post('webhook/razorpay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  async razorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(req.body);
    await this.upgradeService.processWebhook(rawBody, signature ?? '');
    return ApiResponse.success(null, 'Webhook received');
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices for current tenant' })
  async listInvoices(
    @Query() query: InvoiceQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.queryBus.execute(
      new ListInvoicesQuery(tenantId, query.page ?? 1, query.limit ?? 20, query.status),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post('invoices/:id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate and download invoice PDF' })
  async downloadInvoice(@Param('id') id: string) {
    const pdfUrl = await this.invoiceGenerator.generatePdf(id);
    return ApiResponse.success({ pdfUrl }, 'Invoice PDF generated');
  }

  @Post('recalculate-usage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculate tenant usage' })
  async recalculateUsage(@CurrentUser('tenantId') tenantId: string) {
    await this.commandBus.execute(new RecalculateUsageCommand(tenantId));
    return ApiResponse.success(null, 'Usage recalculated');
  }
}
