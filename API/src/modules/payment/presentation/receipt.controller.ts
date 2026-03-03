import {
  Controller, Get, Post, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReceiptService } from '../services/receipt.service';

@ApiTags('Receipts')
@Controller('api/v1/receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /** Generate receipt for a payment */
  @Post('generate/:paymentId')
  generate(@Req() req: any, @Param('paymentId') paymentId: string) {
    return this.receiptService.generateForPayment(req.user.tenantId, paymentId, req.user.id);
  }

  /** List receipts */
  @Get()
  list(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.receiptService.list(req.user.tenantId, Number(page) || 1, Number(limit) || 20);
  }

  /** Get receipt by ID */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.receiptService.getById(req.user.tenantId, id);
  }

  /** Get receipt by payment ID */
  @Get('payment/:paymentId')
  getByPaymentId(@Req() req: any, @Param('paymentId') paymentId: string) {
    return this.receiptService.getByPaymentId(req.user.tenantId, paymentId);
  }
}
