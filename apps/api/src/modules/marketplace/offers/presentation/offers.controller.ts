import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateOfferCommand } from '../application/commands/create-offer/create-offer.command';
import { ActivateOfferCommand } from '../application/commands/activate-offer/activate-offer.command';
import { RedeemOfferCommand } from '../application/commands/redeem-offer/redeem-offer.command';
import { GetOfferQuery } from '../application/queries/get-offer/get-offer.query';
import { ListOffersQuery } from '../application/queries/list-offers/list-offers.query';
import { CheckEligibilityQuery } from '../application/queries/check-eligibility/check-eligibility.query';
import { CreateOfferDto } from './dto/create-offer.dto';

@ApiTags('Marketplace - Offers')
@ApiBearerAuth()
@Controller('marketplace/offers')
export class OffersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  async create(
    @Body() dto: CreateOfferDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const id = await this.commandBus.execute(
      new CreateOfferCommand(
        tenantId,
        userId,
        userId,
        dto.title,
        dto.offerType,
        dto.discountType,
        dto.discountValue,
        dto.description,
        dto.mediaUrls,
        dto.linkedListingIds,
        dto.linkedCategoryIds,
        dto.primaryListingId,
        dto.conditions,
        dto.maxRedemptions,
        dto.autoCloseOnLimit,
        dto.resetTime,
        dto.publishAt ? new Date(dto.publishAt) : undefined,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      ),
    );
    const offer = await this.queryBus.execute(new GetOfferQuery(id, tenantId));
    return ApiResponse.success(offer, 'Offer created');
  }

  @Get()
  @ApiOperation({ summary: 'List offers' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('offerType') offerType?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListOffersQuery(
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        status,
        offerType,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const offer = await this.queryBus.execute(new GetOfferQuery(id, tenantId));
    return ApiResponse.success(offer);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate an offer' })
  async activate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new ActivateOfferCommand(id, tenantId, userId));
    const offer = await this.queryBus.execute(new GetOfferQuery(id, tenantId));
    return ApiResponse.success(offer, 'Offer activated');
  }

  @Post(':id/redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem an offer' })
  async redeem(
    @Param('id') id: string,
    @Body() body: {
      orderId?: string;
      orderValue?: number;
      quantity?: number;
      city?: string;
      state?: string;
      pincode?: string;
      deviceType?: string;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new RedeemOfferCommand(id, tenantId, userId, body.orderId, body.orderValue, body.quantity,
        undefined, undefined, body.city, body.state, body.pincode, body.deviceType),
    );
    return ApiResponse.success(result, 'Offer redeemed');
  }

  @Get(':id/check-eligibility')
  @ApiOperation({ summary: 'Check offer eligibility for current user' })
  async checkEligibility(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('orderValue') orderValue?: string,
    @Query('quantity') quantity?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const result = await this.queryBus.execute(
      new CheckEligibilityQuery(
        id, tenantId, userId, city, state, undefined, undefined, undefined, undefined,
        orderValue ? parseInt(orderValue, 10) : undefined,
        quantity ? parseInt(quantity, 10) : undefined,
      ),
    );
    return ApiResponse.success(result);
  }
}
