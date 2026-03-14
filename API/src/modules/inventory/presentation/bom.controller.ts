import {
  Controller, Get, Post, Patch, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { BOMFormulaService } from '../services/bom-formula.service';
import { BOMCalculationService } from '../services/bom-calculation.service';
import { BOMProductionService } from '../services/bom-production.service';
import { ScrapService } from '../services/scrap.service';
import { BOMReportService } from '../services/bom-report.service';
import {
  CreateBOMFormulaDto, UpdateBOMFormulaDto, CheckStockDto,
  StartProductionDto, CompleteProductionDto, CancelProductionDto,
  RecordScrapDto, WriteOffScrapDto,
} from './dto/bom.dto';

@ApiTags('BOM / Recipes')
@ApiBearerAuth()
@Controller('inventory')
export class BOMController {
  constructor(
    private readonly formulaService: BOMFormulaService,
    private readonly calculationService: BOMCalculationService,
    private readonly productionService: BOMProductionService,
    private readonly scrapService: ScrapService,
    private readonly reportService: BOMReportService,
  ) {}

  // ─── RECIPES / FORMULAS ───

  @Post('recipes')
  @ApiOperation({ summary: 'Create recipe / BOM formula' })
  @RequirePermissions('inventory:create')
  async createRecipe(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateBOMFormulaDto,
  ) {
    const data = await this.formulaService.create(tenantId, dto);
    return ApiResponse.success(data, 'Recipe created');
  }

  @Get('recipes')
  @ApiOperation({ summary: 'List recipes' })
  @RequirePermissions('inventory:read')
  async listRecipes(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('industryCode') industryCode?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.formulaService.findAll(tenantId, {
      productId, industryCode, search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    return ApiResponse.success(data);
  }

  @Get('recipes/:id')
  @ApiOperation({ summary: 'Get recipe detail with stock levels' })
  @RequirePermissions('inventory:read')
  async getRecipe(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.formulaService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Patch('recipes/:id')
  @ApiOperation({ summary: 'Update recipe (creates new version if items changed)' })
  @RequirePermissions('inventory:update')
  async updateRecipe(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBOMFormulaDto,
  ) {
    const data = await this.formulaService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Recipe updated');
  }

  @Post('recipes/:id/duplicate')
  @ApiOperation({ summary: 'Duplicate recipe' })
  @RequirePermissions('inventory:create')
  async duplicateRecipe(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newName') newName: string,
  ) {
    const data = await this.formulaService.duplicate(tenantId, id, newName);
    return ApiResponse.success(data, 'Recipe duplicated');
  }

  @Post('recipes/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate recipe' })
  @RequirePermissions('inventory:update')
  async deactivateRecipe(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.formulaService.deactivate(tenantId, id);
    return ApiResponse.success(data, 'Recipe deactivated');
  }

  @Post('recipes/:id/check-stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check stock availability for production' })
  @RequirePermissions('inventory:read')
  async checkStock(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckStockDto,
  ) {
    const data = await this.calculationService.checkStock(tenantId, id, dto.quantity, dto.locationId);
    return ApiResponse.success(data);
  }

  // ─── PRODUCTION ───

  @Post('production')
  @ApiOperation({ summary: 'Start production run' })
  @RequirePermissions('inventory:create')
  async startProduction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StartProductionDto,
  ) {
    const data = await this.productionService.startProduction(tenantId, userId, dto);
    return ApiResponse.success(data, 'Production started');
  }

  @Get('production')
  @ApiOperation({ summary: 'List production runs' })
  @RequirePermissions('inventory:read')
  async listProduction(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('formulaId') formulaId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.productionService.findAll(tenantId, { status, formulaId, startDate, endDate });
    return ApiResponse.success(data);
  }

  @Get('production/:id')
  @ApiOperation({ summary: 'Get production detail with transactions + scrap' })
  @RequirePermissions('inventory:read')
  async getProduction(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.productionService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('production/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete production (deduct raw materials, add finished product)' })
  @RequirePermissions('inventory:update')
  async completeProduction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteProductionDto,
  ) {
    const data = await this.productionService.completeProduction(tenantId, userId, id, dto);
    return ApiResponse.success(data, 'Production completed');
  }

  @Post('production/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel production run' })
  @RequirePermissions('inventory:update')
  async cancelProduction(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelProductionDto,
  ) {
    const data = await this.productionService.cancel(tenantId, id, dto.reason);
    return ApiResponse.success(data, 'Production cancelled');
  }

  // ─── SCRAP ───

  @Get('scrap')
  @ApiOperation({ summary: 'List scrap records' })
  @RequirePermissions('inventory:read')
  async listScrap(
    @CurrentUser('tenantId') tenantId: string,
    @Query('scrapType') scrapType?: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.scrapService.findAll(tenantId, { scrapType, productId, locationId, startDate, endDate });
    return ApiResponse.success(data);
  }

  @Post('scrap')
  @ApiOperation({ summary: 'Record scrap manually' })
  @RequirePermissions('inventory:create')
  async recordScrap(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RecordScrapDto,
  ) {
    const data = await this.scrapService.recordScrap(tenantId, userId, dto);
    return ApiResponse.success(data, 'Scrap recorded');
  }

  @Post('scrap/:id/write-off')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Write off scrap' })
  @RequirePermissions('inventory:update')
  async writeOffScrap(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WriteOffScrapDto,
  ) {
    const data = await this.scrapService.writeOff(tenantId, id, dto.disposalMethod);
    return ApiResponse.success(data, 'Scrap written off');
  }

  // ─── REPORTS ───

  @Get('reports/production')
  @ApiOperation({ summary: 'Production report' })
  @RequirePermissions('inventory:read')
  async productionReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('formulaId') formulaId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.reportService.productionReport(tenantId, { startDate, endDate, formulaId, status });
    return ApiResponse.success(data);
  }

  @Get('reports/consumption')
  @ApiOperation({ summary: 'Raw material consumption report' })
  @RequirePermissions('inventory:read')
  async consumptionReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ) {
    const data = await this.reportService.consumptionReport(tenantId, { startDate, endDate, productId });
    return ApiResponse.success(data);
  }

  @Get('reports/bom-costing')
  @ApiOperation({ summary: 'BOM cost breakdown' })
  @RequirePermissions('inventory:read')
  async costingReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('formulaId') formulaId: string,
  ) {
    const data = await this.reportService.costingReport(tenantId, formulaId);
    return ApiResponse.success(data);
  }

  @Get('reports/yield')
  @ApiOperation({ summary: 'Yield analysis (actual vs expected)' })
  @RequirePermissions('inventory:read')
  async yieldReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportService.yieldReport(tenantId, { startDate, endDate });
    return ApiResponse.success(data);
  }
}
