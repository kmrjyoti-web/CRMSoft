import {
  Controller, Get, Post, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ProductTaxGstCalculatorService } from '../services/gst-calculator.service';
import { SetTaxDetailsDto, CalculateGstDto } from './dto/product-tax.dto';

@ApiTags('Product Tax')
@ApiBearerAuth()
@Controller('tax')
export class ProductTaxController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gstCalculator: ProductTaxGstCalculatorService,
  ) {}

  @Post(':productId/details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set tax details for product (replace all)' })
  @RequirePermissions('products:update')
  async setTaxDetails(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetTaxDetailsDto,
  ) {
    await this.prisma.productTaxDetail.deleteMany({ where: { productId } });

    const details = await this.prisma.productTaxDetail.createMany({
      data: dto.taxes.map((t) => ({
        productId,
        taxName: t.taxName,
        taxRate: t.taxRate,
        description: t.description,
      })),
    });

    const created = await this.prisma.productTaxDetail.findMany({
      where: { productId },
      orderBy: { taxName: 'asc' },
    });

    return ApiResponse.success(created, `${details.count} tax detail(s) set`);
  }

  @Get(':productId/details')
  @ApiOperation({ summary: 'Get tax details for product' })
  @RequirePermissions('products:read')
  async getTaxDetails(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const details = await this.prisma.productTaxDetail.findMany({
      where: { productId },
      orderBy: { taxName: 'asc' },
    });
    return ApiResponse.success(details);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate GST breakup for given amount' })
  @RequirePermissions('products:read')
  async calculateGst(@Body() dto: CalculateGstDto) {
    const breakup = this.gstCalculator.calculateGST({
      amount: dto.amount,
      gstRate: dto.gstRate,
      cessRate: dto.cessRate,
      isInterState: dto.isInterState,
      taxInclusive: dto.taxInclusive,
    });
    return ApiResponse.success(breakup, 'GST calculated');
  }

  @Get('hsn-lookup')
  @ApiOperation({ summary: 'Lookup HSN code (placeholder)' })
  @RequirePermissions('products:read')
  async hsnLookup(@Query('code') code: string) {
    const result = {
      hsnCode: code || '8471',
      suggestedRate: 18,
      description: 'Computers and related',
    };
    return ApiResponse.success(result, 'HSN lookup result');
  }
}
