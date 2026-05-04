import {
  Controller, Get, Post, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import { RechargeService } from '../services/recharge.service';
import { CouponService } from '../services/coupon.service';
import { ServiceRateService } from '../services/service-rate.service';
import { WalletTransactionQueryDto } from './dto/wallet-query.dto';
import { InitiateRechargeDto, CompleteRechargeDto } from './dto/recharge.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CostEstimateDto } from './dto/cost-estimate.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly txnService: WalletTransactionService,
    private readonly rechargeService: RechargeService,
    private readonly couponService: CouponService,
    private readonly rateService: ServiceRateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance and summary' })
  async getBalance(@CurrentUser('tenantId') tenantId: string) {
    // SuperAdmin has no tenantId — return a zero-balance placeholder
    if (!tenantId) {
      return ApiResponse.success({
        id: null,
        balance: 0,
        promoBalance: 0,
        totalAvailable: 0,
        lifetimeCredit: 0,
        lifetimeDebit: 0,
        currency: 'INR',
        tokenRate: 100,
        isActive: false,
      });
    }
    const balance = await this.walletService.getBalance(tenantId);
    return ApiResponse.success(balance);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: WalletTransactionQueryDto,
  ) {
    const result = await this.txnService.getHistory(tenantId, query);
    return ApiResponse.success(result.data, undefined, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  @Post('recharge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate a recharge' })
  async initiateRecharge(
    @Body() dto: InitiateRechargeDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.rechargeService.initiateRecharge(
      tenantId,
      dto.planId,
      dto.couponCode,
    );
    return ApiResponse.success(result);
  }

  @Post('recharge/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment and credit tokens' })
  async completeRecharge(
    @Body() dto: CompleteRechargeDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.rechargeService.completeRecharge(
      tenantId,
      dto.planId,
      dto.paymentId,
      dto.couponCode,
      userId,
    );
    return ApiResponse.success(result, 'Recharge successful');
  }

  @Post('apply-coupon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and preview coupon' })
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    const result = await this.couponService.validate(dto.code, dto.rechargeAmount);
    return ApiResponse.success(result);
  }

  @Get('recharge-plans')
  @ApiOperation({ summary: 'List available recharge plans' })
  async getRechargePlans() {
    const plans = await this.rechargeService.listPlans(true);
    return ApiResponse.success(plans);
  }

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cost estimate for a service' })
  async estimateCost(
    @Body() dto: CostEstimateDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const estimate = await this.rateService.estimateCost(dto.serviceKey);
    const balance = await this.walletService.getBalance(tenantId);

    return ApiResponse.success({
      ...estimate,
      currentBalance: balance.totalAvailable,
      balanceAfter: estimate ? balance.totalAvailable - estimate.finalTokens : balance.totalAvailable,
      sufficient: estimate ? balance.totalAvailable >= estimate.finalTokens : true,
    });
  }
}
