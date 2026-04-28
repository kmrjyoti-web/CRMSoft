import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequireBusinessMode, BusinessModeGuard } from '../../../../common/guards/business-mode.guard';
import { CreateListingCommand } from '../application/commands/create-listing/create-listing.command';
import { UpdateListingCommand } from '../application/commands/update-listing/update-listing.command';
import { PublishListingCommand } from '../application/commands/publish-listing/publish-listing.command';
import { GetListingQuery } from '../application/queries/get-listing/get-listing.query';
import { ListListingsQuery } from '../application/queries/list-listings/list-listings.query';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@ApiTags('Marketplace - Listings')
@ApiBearerAuth()
@Controller('marketplace/listings')
export class ListingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new marketplace listing' })
  @UseGuards(BusinessModeGuard)
  @RequireBusinessMode('B2B', 'B2C', 'SERVICE_B2B', 'SERVICE_B2C')
  async create(
    @Body() dto: CreateListingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const id = await this.commandBus.execute(
      new CreateListingCommand(
        tenantId,
        userId,
        dto.listingType,
        dto.title,
        userId,
        dto.description,
        dto.shortDescription,
        dto.categoryId,
        dto.subcategoryId,
        dto.mediaUrls,
        dto.currency,
        dto.basePrice,
        dto.mrp,
        dto.minOrderQty,
        dto.maxOrderQty,
        dto.hsnCode,
        dto.gstRate,
        dto.trackInventory,
        dto.stockAvailable,
        dto.visibility,
        dto.visibilityConfig,
        dto.publishAt ? new Date(dto.publishAt) : undefined,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        dto.attributes,
        dto.keywords,
        dto.shippingConfig,
        dto.requirementConfig,
        dto.priceTiers,
      ),
    );
    const listing = await this.queryBus.execute(new GetListingQuery(id, tenantId));
    return ApiResponse.success(listing, 'Listing created');
  }

  @Get()
  @ApiOperation({ summary: 'List marketplace listings' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('listingType') listingType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListListingsQuery(
        tenantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        status,
        listingType,
        categoryId,
        search,
        authorId,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a listing by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const listing = await this.queryBus.execute(new GetListingQuery(id, tenantId));
    return ApiResponse.success(listing);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a listing' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(
      new UpdateListingCommand(
        id,
        tenantId,
        userId,
        dto.title,
        dto.description,
        dto.shortDescription,
        dto.categoryId,
        dto.subcategoryId,
        dto.mediaUrls,
        dto.basePrice,
        dto.mrp,
        dto.minOrderQty,
        dto.maxOrderQty,
        dto.hsnCode,
        dto.gstRate,
        dto.stockAvailable,
        dto.visibility,
        dto.visibilityConfig,
        dto.publishAt ? new Date(dto.publishAt) : undefined,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        dto.attributes,
        dto.keywords,
        dto.shippingConfig,
        dto.requirementConfig,
      ),
    );
    const listing = await this.queryBus.execute(new GetListingQuery(id, tenantId));
    return ApiResponse.success(listing, 'Listing updated');
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a listing' })
  async publish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new PublishListingCommand(id, tenantId, userId));
    const listing = await this.queryBus.execute(new GetListingQuery(id, tenantId));
    return ApiResponse.success(listing, 'Listing published');
  }
}
