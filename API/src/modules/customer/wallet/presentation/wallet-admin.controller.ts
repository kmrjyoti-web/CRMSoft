import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { SuperAdminGuard } from '../../../core/tenant/infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../../../core/tenant/infrastructure/decorators/super-admin-route.decorator';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import { RechargeService } from '../services/recharge.service';
import { CouponService } from '../services/coupon.service';
import { ServiceRateService } from '../services/service-rate.service';
import { WalletAnalyticsService } from '../services/wallet-analytics.service';
import { DebitWalletDto } from './dto/debit-wallet.dto';
import { CreateRechargePlanDto, UpdateRechargePlanDto } from './dto/create-recharge-plan.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { CreateServiceRateDto, UpdateServiceRateDto } from './dto/create-service-rate.dto';

@ApiTags('Wallet Admin')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/wallet')
export class WalletAdminController {
  constructor(
    private readonly walletService: WalletService,
    private readonly txnService: WalletTransactionService,
    private readonly rechargeService: RechargeService,
    private readonly couponService: CouponService,
    private readonly rateService: ServiceRateService,
    private readonly analyticsService: WalletAnalyticsService,
  ) {}

  // ─── Wallets ───

  @Get('wallets')
  @ApiOperation({ summary: 'List all tenant wallets' })
  async listWallets(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.walletService.findAll({ page, limit });
    return ApiResponse.success(result.data, undefined, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  @Get('wallets/:tenantId')
  @ApiOperation({ summary: 'Get wallet for a tenant' })
  async getWallet(@Param('tenantId') tenantId: string) {
    const balance = await this.walletService.getBalance(tenantId);
    return ApiResponse.success(balance);
  }

  @Post('wallets/:tenantId/credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manual credit to tenant wallet' })
  async creditWallet(
    @Param('tenantId') tenantId: string,
    @Body() dto: DebitWalletDto,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.txnService.credit(tenantId, {
      tokens: dto.tokens,
      type: 'ADJUSTMENT',
      description: dto.description,
      referenceType: 'ADMIN_CREDIT',
      createdById: adminId,
    });
    return ApiResponse.success(result, 'Wallet credited');
  }

  @Post('wallets/:tenantId/debit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manual debit from tenant wallet' })
  async debitWallet(
    @Param('tenantId') tenantId: string,
    @Body() dto: DebitWalletDto,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.txnService.debit(tenantId, {
      tokens: dto.tokens,
      description: dto.description,
      referenceType: 'ADMIN_DEBIT',
      createdById: adminId,
    });
    return ApiResponse.success(result, 'Wallet debited');
  }

  // ─── Recharge Plans ───

  @Get('recharge-plans')
  @ApiOperation({ summary: 'List all recharge plans' })
  async listRechargePlans() {
    const plans = await this.rechargeService.listPlans(false);
    return ApiResponse.success(plans);
  }

  @Post('recharge-plans')
  @ApiOperation({ summary: 'Create recharge plan' })
  async createRechargePlan(@Body() dto: CreateRechargePlanDto) {
    const plan = await this.rechargeService.createPlan(dto);
    return ApiResponse.success(plan, 'Recharge plan created');
  }

  @Put('recharge-plans/:id')
  @ApiOperation({ summary: 'Update recharge plan' })
  async updateRechargePlan(@Param('id') id: string, @Body() dto: UpdateRechargePlanDto) {
    const plan = await this.rechargeService.updatePlan(id, dto);
    return ApiResponse.success(plan, 'Recharge plan updated');
  }

  @Delete('recharge-plans/:id')
  @ApiOperation({ summary: 'Delete recharge plan' })
  async deleteRechargePlan(@Param('id') id: string) {
    await this.rechargeService.deletePlan(id);
    return ApiResponse.success(null, 'Recharge plan deleted');
  }

  // ─── Coupons ───

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons() {
    const coupons = await this.couponService.findAll();
    return ApiResponse.success(coupons);
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.couponService.create(dto);
    return ApiResponse.success(coupon, 'Coupon created');
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: 'Update coupon' })
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const coupon = await this.couponService.update(id, dto);
    return ApiResponse.success(coupon, 'Coupon updated');
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete coupon' })
  async deleteCoupon(@Param('id') id: string) {
    await this.couponService.delete(id);
    return ApiResponse.success(null, 'Coupon deleted');
  }

  // ─── Service Rates ───

  @Get('service-rates')
  @ApiOperation({ summary: 'List all service rates' })
  async listServiceRates(@Query('category') category?: string) {
    const rates = await this.rateService.findAll({ category });
    return ApiResponse.success(rates);
  }

  @Post('service-rates')
  @ApiOperation({ summary: 'Create service rate' })
  async createServiceRate(@Body() dto: CreateServiceRateDto) {
    const rate = await this.rateService.create(dto);
    return ApiResponse.success(rate, 'Service rate created');
  }

  @Put('service-rates/:id')
  @ApiOperation({ summary: 'Update service rate' })
  async updateServiceRate(@Param('id') id: string, @Body() dto: UpdateServiceRateDto) {
    const rate = await this.rateService.update(id, dto);
    return ApiResponse.success(rate, 'Service rate updated');
  }

  @Delete('service-rates/:id')
  @ApiOperation({ summary: 'Delete service rate' })
  async deleteServiceRate(@Param('id') id: string) {
    await this.rateService.delete(id);
    return ApiResponse.success(null, 'Service rate deleted');
  }

  // ─── Analytics ───

  @Get('wallet-analytics/summary')
  @ApiOperation({ summary: 'Platform revenue summary' })
  async getRevenueSummary(@Query('days') days?: number) {
    const summary = await this.analyticsService.getRevenueSummary(days ?? 30);
    return ApiResponse.success(summary);
  }

  @Get('wallet-analytics/spend-by-category')
  @ApiOperation({ summary: 'Spend breakdown by category' })
  async getSpendByCategory(
    @Query('tenantId') tenantId?: string,
    @Query('days') days?: number,
  ) {
    const data = await this.analyticsService.getSpendByCategory(tenantId, days ?? 30);
    return ApiResponse.success(data);
  }

  @Get('wallet-analytics/top-services')
  @ApiOperation({ summary: 'Top services by spend' })
  async getTopServices(
    @Query('tenantId') tenantId?: string,
    @Query('days') days?: number,
  ) {
    const data = await this.analyticsService.getTopServices(tenantId, days ?? 30);
    return ApiResponse.success(data);
  }

  @Get('wallet-analytics/daily-trend')
  @ApiOperation({ summary: 'Daily spend trend' })
  async getDailyTrend(
    @Query('tenantId') tenantId?: string,
    @Query('days') days?: number,
  ) {
    const data = await this.analyticsService.getDailySpendTrend(tenantId, days ?? 30);
    return ApiResponse.success(data);
  }
}
