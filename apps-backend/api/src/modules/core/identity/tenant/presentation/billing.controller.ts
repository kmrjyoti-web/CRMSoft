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
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('tenant/billing')
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly invoiceGenerator: InvoiceGeneratorService,
    private readonly upgradeService: TenantUpgradeService,
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
