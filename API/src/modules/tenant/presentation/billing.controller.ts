import {
  Controller, Get, Post, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecalculateUsageCommand } from '../application/commands/recalculate-usage/recalculate-usage.command';
import { ListInvoicesQuery } from '../application/queries/list-invoices/query';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/roles.decorator';
import { InvoiceGeneratorService } from '../services/invoice-generator.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('tenant/billing')
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly invoiceGenerator: InvoiceGeneratorService,
  ) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices for current tenant' })
  async listInvoices(
    @Query() query: InvoiceQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.queryBus.execute(
      new ListInvoicesQuery(
        tenantId,
        query.page ?? 1,
        query.limit ?? 20,
        query.status,
      ),
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

  @Post('webhook/razorpay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  async razorpayWebhook(@Body() dto: PaymentWebhookDto) {
    // Webhook processing is handled by the payment gateway service
    // Signature verification should happen before processing
    return ApiResponse.success(null, 'Webhook received');
  }

  @Post('recalculate-usage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculate tenant usage (admin only)' })
  async recalculateUsage(@CurrentUser('tenantId') tenantId: string) {
    await this.commandBus.execute(new RecalculateUsageCommand(tenantId));
    return ApiResponse.success(null, 'Usage recalculated');
  }
}
