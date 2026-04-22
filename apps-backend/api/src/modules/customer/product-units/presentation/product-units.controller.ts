import {
  Controller, Get, Post, Delete, Param, Body,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { UnitConverterService } from '../services/unit-converter.service';
import { SetConversionsDto, ConvertDto } from './dto/product-unit.dto';

const UNIT_TYPES = [
  'PIECE', 'BOX', 'PACK', 'CARTON', 'KG', 'GRAM', 'LITRE', 'ML',
  'METER', 'CM', 'SQ_FT', 'SQ_METER', 'DOZEN', 'SET', 'PAIR',
  'ROLL', 'BUNDLE',
];

const UNIT_LABELS: Record<string, string> = {
  PIECE: 'Piece', BOX: 'Box', PACK: 'Pack', CARTON: 'Carton',
  KG: 'Kilogram', GRAM: 'Gram', LITRE: 'Litre', ML: 'Millilitre',
  METER: 'Meter', CM: 'Centimeter', SQ_FT: 'Square Foot',
  SQ_METER: 'Square Meter', DOZEN: 'Dozen', SET: 'Set',
  PAIR: 'Pair', ROLL: 'Roll', BUNDLE: 'Bundle',
};

@ApiTags('Product Units')
@ApiBearerAuth()
@Controller('units')
export class ProductUnitsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConverter: UnitConverterService,
  ) {}

  @Post(':productId/conversions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set unit conversions for product (upsert)' })
  @RequirePermissions('products:update')
  async setConversions(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetConversionsDto,
  ) {
    const results: any[] = [];

    for (const c of dto.conversions) {
      const existing = await this.prisma.working.productUnitConversion.findFirst({
        where: {
          productId,
          fromUnit: c.fromUnit as any,
          toUnit: c.toUnit as any,
        },
      });
      let record;
      if (existing) {
        record = await this.prisma.working.productUnitConversion.update({
          where: { id: existing.id },
          data: {
            conversionRate: c.conversionRate,
            isDefault: c.isDefault ?? false,
          },
        });
      } else {
        record = await this.prisma.working.productUnitConversion.create({
          data: {
            productId,
            fromUnit: c.fromUnit as any,
            toUnit: c.toUnit as any,
            conversionRate: c.conversionRate,
            isDefault: c.isDefault ?? false,
          },
        });
      }
      results.push(record);
    }

    return ApiResponse.success(results, `${results.length} conversion(s) set`);
  }

  @Get(':productId/conversions')
  @ApiOperation({ summary: 'Get all conversions for product' })
  @RequirePermissions('products:read')
  async getConversions(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const conversions = await this.prisma.working.productUnitConversion.findMany({
      where: { productId },
      orderBy: { fromUnit: 'asc' },
    });
    return ApiResponse.success(conversions);
  }

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert quantity between units' })
  @RequirePermissions('products:read')
  async convert(@Body() dto: ConvertDto) {
    const result = await this.unitConverter.convert(this.prisma, {
      productId: dto.productId,
      quantity: dto.quantity,
      fromUnit: dto.fromUnit,
      toUnit: dto.toUnit,
    });
    return ApiResponse.success(result, 'Conversion complete');
  }

  @Get('types')
  @ApiOperation({ summary: 'List all UnitType enum values' })
  @RequirePermissions('products:read')
  async getTypes() {
    const types = UNIT_TYPES.map((value) => ({
      value,
      label: UNIT_LABELS[value] || value,
    }));
    return ApiResponse.success(types);
  }

  @Delete('conversions/:conversionId')
  @ApiOperation({ summary: 'Remove a unit conversion' })
  @RequirePermissions('products:update')
  async removeConversion(
    @Param('conversionId', ParseUUIDPipe) conversionId: string,
  ) {
    await this.prisma.working.productUnitConversion.delete({
      where: { id: conversionId },
    });
    return ApiResponse.success(null, 'Conversion removed');
  }
}
