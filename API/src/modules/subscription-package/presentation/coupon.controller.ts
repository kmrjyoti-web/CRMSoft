import {
  Controller, Get, Post, Put, Body, Param, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CouponEngineService } from '../services/coupon-engine.service';
import {
  ValidateCouponDto,
  RedeemCouponDto,
  CreateCouponDto,
  UpdateCouponDto,
  CouponListQueryDto,
} from './dto/coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponEngine: CouponEngineService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validate(
    @Body() dto: ValidateCouponDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.couponEngine.validate(
      dto.couponCode,
      tenantId,
      userId,
      dto.packageCode,
      dto.amount,
    );
    return ApiResponse.success(result);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem a coupon' })
  async redeem(
    @Body() dto: RedeemCouponDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const redemption = await this.couponEngine.redeem(
      dto.couponCode,
      tenantId,
      userId,
      dto.discountApplied,
    );
    return ApiResponse.success(redemption, 'Coupon redeemed successfully');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a coupon (admin)' })
  async create(@Body() dto: CreateCouponDto) {
    const coupon = await this.couponEngine.create(dto);
    return ApiResponse.success(coupon, 'Coupon created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a coupon (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    const coupon = await this.couponEngine.update(id, dto);
    return ApiResponse.success(coupon, 'Coupon updated');
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons (admin)' })
  async listAll(@Query() query: CouponListQueryDto) {
    const result = await this.couponEngine.listAll(query);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
