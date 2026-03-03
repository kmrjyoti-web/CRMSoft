import {
  Controller, Get, Post, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { PaymentAnalyticsService } from '../services/payment-analytics.service';
import {
  RecordPaymentDto, CreateGatewayOrderDto,
  VerifyGatewayPaymentDto, PaymentQueryDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly analytics: PaymentAnalyticsService,
  ) {}

  /** Record offline/manual payment */
  @Post('record')
  recordPayment(@Req() req: any, @Body() dto: RecordPaymentDto) {
    return this.paymentService.recordPayment(req.user.tenantId, dto, req.user.id);
  }

  /** Create gateway order for online payment */
  @Post('gateway/order')
  createGatewayOrder(@Req() req: any, @Body() dto: CreateGatewayOrderDto) {
    return this.paymentService.createGatewayOrder(req.user.tenantId, dto, req.user.id);
  }

  /** Verify gateway payment */
  @Post('gateway/verify')
  verifyGatewayPayment(@Req() req: any, @Body() dto: VerifyGatewayPaymentDto) {
    return this.paymentService.verifyGatewayPayment(req.user.tenantId, dto);
  }

  /** List payments */
  @Get()
  list(@Req() req: any, @Query() query: PaymentQueryDto) {
    return this.paymentService.list(req.user.tenantId, query);
  }

  /** Payment collection summary */
  @Get('analytics/collection')
  collection(@Req() req: any, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.analytics.getCollectionSummary(req.user.tenantId, fromDate, toDate);
  }

  /** Outstanding invoices summary */
  @Get('analytics/outstanding')
  outstanding(@Req() req: any) {
    return this.analytics.getOutstandingSummary(req.user.tenantId);
  }

  /** Refund summary */
  @Get('analytics/refunds')
  refundSummary(@Req() req: any) {
    return this.analytics.getRefundSummary(req.user.tenantId);
  }

  /** Get single payment */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.getById(req.user.tenantId, id);
  }
}
