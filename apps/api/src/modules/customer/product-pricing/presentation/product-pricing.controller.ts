import {
  Controller, Get, Post, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SetPricesDto, SetSlabPricesDto, BulkPriceUpdateDto } from './dto/set-prices.dto';
import { GetEffectivePriceDto } from './dto/get-effective-price.dto';
import { SetProductPricesCommand } from '../application/commands/set-product-prices/set-product-prices.command';
import { SetGroupPriceCommand } from '../application/commands/set-group-price/set-group-price.command';
import { SetSlabPriceCommand } from '../application/commands/set-slab-price/set-slab-price.command';
import { GetEffectivePriceQuery } from '../application/queries/get-effective-price/get-effective-price.query';
import { GetPriceListQuery } from '../application/queries/get-price-list/get-price-list.query';

@ApiTags('Product Pricing')
@ApiBearerAuth()
@Controller('pricing')
export class ProductPricingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':productId/prices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set product prices (upsert batch)' })
  @RequirePermissions('product_pricing:update')
  async setPrices(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetPricesDto,
  ) {
    const result = await this.commandBus.execute(
      new SetProductPricesCommand(productId, dto.prices),
    );
    return ApiResponse.success(result, 'Prices set');
  }

  @Post(':productId/group-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a group-specific price' })
  @RequirePermissions('product_pricing:update')
  async setGroupPrice(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { priceGroupId: string; priceType: string; amount: number },
  ) {
    const result = await this.commandBus.execute(
      new SetGroupPriceCommand(
        productId, body.priceGroupId, body.priceType, body.amount,
      ),
    );
    return ApiResponse.success(result, 'Group price set');
  }

  @Post(':productId/slab-prices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set slab pricing' })
  @RequirePermissions('product_pricing:update')
  async setSlabPrices(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetSlabPricesDto,
  ) {
    const result = await this.commandBus.execute(
      new SetSlabPriceCommand(productId, dto.priceType, dto.slabs),
    );
    return ApiResponse.success(result, 'Slab prices set');
  }

  @Get(':productId/price-list')
  @ApiOperation({ summary: 'Get full price list for product' })
  @RequirePermissions('product_pricing:read')
  async getPriceList(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetPriceListQuery(productId),
    );
    return ApiResponse.success(result);
  }

  @Post('effective-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate effective price with GST breakup' })
  @RequirePermissions('product_pricing:read')
  async getEffectivePrice(@Body() dto: GetEffectivePriceDto) {
    const result = await this.queryBus.execute(
      new GetEffectivePriceQuery(
        dto.productId,
        dto.contactId,
        dto.organizationId,
        dto.quantity,
        dto.isInterState,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get(':productId/prices')
  @ApiOperation({ summary: 'Get all prices for product (filterable)' })
  @RequirePermissions('product_pricing:read')
  async getProductPrices(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('priceType') priceType?: string,
    @Query('groupId') groupId?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetPriceListQuery(productId),
    );
    return ApiResponse.success(result);
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update prices for multiple products' })
  @RequirePermissions('product_pricing:update')
  async bulkUpdate(@Body() dto: BulkPriceUpdateDto) {
    const results: any[] = [];
    for (const item of dto.updates) {
      const result = await this.commandBus.execute(
        new SetProductPricesCommand(item.productId, item.prices),
      );
      results.push(result);
    }
    return ApiResponse.success(
      results, `${results.length} product(s) updated`,
    );
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare base prices across products' })
  @RequirePermissions('product_pricing:read')
  async comparePrices(@Query('productIds') productIds: string) {
    const ids = productIds.split(',').map((s) => s.trim()).filter(Boolean);
    const products = await this.prisma.working.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, code: true, mrp: true, salePrice: true },
    });
    const prices = await this.prisma.working.productPrice.findMany({
      where: {
        productId: { in: ids }, isActive: true,
        priceGroupId: null,
        OR: [{ minQty: null }, { minQty: 0 }],
      },
      orderBy: [{ priceType: 'asc' }],
    });
    const priceMap = new Map<string, any[]>();
    for (const p of prices) {
      if (!priceMap.has(p.productId)) priceMap.set(p.productId, []);
      priceMap.get(p.productId)!.push({
        priceType: p.priceType, amount: p.amount, currency: p.currency,
      });
    }
    const comparison = products.map((prod) => ({
      productId: prod.id, productName: prod.name, productCode: prod.code,
      mrp: prod.mrp, salePrice: prod.salePrice,
      prices: priceMap.get(prod.id) ?? [],
    }));
    return ApiResponse.success(comparison, 'Price comparison');
  }

  @Delete(':priceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a specific price entry' })
  @RequirePermissions('product_pricing:update')
  async removePrice(@Param('priceId', ParseUUIDPipe) priceId: string) {
    await this.prisma.working.productPrice.update({
      where: { id: priceId },
      data: { isActive: false },
    });
    return ApiResponse.success(null, 'Price removed');
  }
}
