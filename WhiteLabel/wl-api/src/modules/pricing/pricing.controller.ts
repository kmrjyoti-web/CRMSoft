import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get('services')
  listServices() { return this.pricingService.listServices(); }

  @UseGuards(AdminGuard)
  @Post('services')
  createService(@Body() dto: any) { return this.pricingService.createService(dto); }

  @UseGuards(AdminGuard)
  @Patch('services/:code')
  updateService(@Param('code') code: string, @Body() dto: any) { return this.pricingService.updateService(code, dto); }

  @Get('partner/:partnerId')
  getPartnerPricing(@Param('partnerId') partnerId: string) { return this.pricingService.getPartnerPricing(partnerId); }

  @Post('partner')
  setPartnerPricing(@Body() dto: any) { return this.pricingService.setPartnerPricing(dto); }

  @Patch('partner/:id')
  updatePartnerPricing(@Param('id') id: string, @Body() dto: any) { return this.pricingService.setPartnerPricing(dto); }

  @Post('customer')
  setCustomerPricing(@Body() dto: any) { return this.pricingService.setCustomerPricing(dto); }

  @Patch('customer/:id')
  updateCustomerPricing(@Param('id') id: string, @Body() dto: any) { return this.pricingService.setCustomerPricing(dto); }

  @Get('chain/:partnerId/:serviceCode')
  getPricingChain(@Param('partnerId') partnerId: string, @Param('serviceCode') serviceCode: string) {
    return this.pricingService.getPricingChain(partnerId, serviceCode);
  }
}
