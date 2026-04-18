import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsString, IsNumber, IsOptional } from 'class-validator';

class RecordUsageDto {
  @IsString() partnerId: string;
  @IsString() serviceCode: string;
  @IsNumber() units: number;
}

class MarkPaidDto {
  @IsOptional() @IsString() razorpayPaymentId?: string;
}

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller()
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('usage/record')
  recordUsage(@Body() dto: RecordUsageDto) {
    return this.billingService.recordUsage(dto);
  }

  @Get('usage/:partnerId')
  getUsageSummary(@Param('partnerId') partnerId: string, @Query('period') period?: string) {
    return this.billingService.getUsageSummary(partnerId, period);
  }

  @Get('usage/:partnerId/:period')
  getUsageByPeriod(@Param('partnerId') partnerId: string, @Param('period') period: string) {
    return this.billingService.getUsageSummary(partnerId, period);
  }

  @Post('invoices/generate/:partnerId/:period')
  generateInvoice(@Param('partnerId') partnerId: string, @Param('period') period: string) {
    return this.billingService.generateInvoice(partnerId, period);
  }

  @Post('invoices/:id/send')
  sendInvoice(@Param('id') id: string) {
    return this.billingService.sendInvoice(id);
  }

  @Patch('invoices/:id/paid')
  markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.billingService.markPaid(id, dto.razorpayPaymentId);
  }

  @Get('invoices/dashboard')
  getBillingDashboard() {
    return this.billingService.getBillingDashboard();
  }

  @Get('invoices/:partnerId')
  getPartnerInvoices(
    @Param('partnerId') partnerId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.billingService.getPartnerInvoices(partnerId, +page, +limit);
  }

  @Get('invoices/:id/detail')
  getInvoice(@Param('id') id: string) {
    return this.billingService.getInvoice(id);
  }
}
