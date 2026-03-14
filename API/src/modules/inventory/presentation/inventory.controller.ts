import {
  Controller, Get, Post, Patch, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { InventoryService } from '../services/inventory.service';
import { SerialService } from '../services/serial.service';
import { TransactionService } from '../services/transaction.service';
import { LocationService } from '../services/location.service';
import { AdjustmentService } from '../services/adjustment.service';
import { InventoryReportService } from '../services/report.service';
import {
  CreateSerialDto, BulkCreateSerialDto, UpdateSerialDto, ChangeStatusDto,
  RecordTransactionDto, TransferDto,
  CreateLocationDto, UpdateLocationDto,
  CreateAdjustmentDto, ApproveAdjustmentDto,
} from './dto/inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly serialService: SerialService,
    private readonly transactionService: TransactionService,
    private readonly locationService: LocationService,
    private readonly adjustmentService: AdjustmentService,
    private readonly reportService: InventoryReportService,
  ) {}

  // ─── DASHBOARD ───

  @Get('dashboard')
  @ApiOperation({ summary: 'Inventory dashboard KPIs' })
  @RequirePermissions('inventory:read')
  async getDashboard(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.inventoryService.getDashboard(tenantId);
    return ApiResponse.success(data);
  }

  // ─── SERIALS ───

  @Get('serials')
  @ApiOperation({ summary: 'List serial numbers' })
  @RequirePermissions('inventory:read')
  async listSerials(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.serialService.list(tenantId, {
      productId, status, locationId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('serials/search')
  @ApiOperation({ summary: 'Search serials by number/code' })
  @RequirePermissions('inventory:read')
  async searchSerials(
    @CurrentUser('tenantId') tenantId: string,
    @Query('q') query: string,
  ) {
    const data = await this.serialService.search(tenantId, query);
    return ApiResponse.success(data);
  }

  @Get('serials/expiring')
  @ApiOperation({ summary: 'Get expiring serials' })
  @RequirePermissions('inventory:read')
  async getExpiringSerials(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    const data = await this.serialService.getExpiring(tenantId, days ? parseInt(days) : 30);
    return ApiResponse.success(data);
  }

  @Get('serials/:id')
  @ApiOperation({ summary: 'Get serial detail' })
  @RequirePermissions('inventory:read')
  async getSerial(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.serialService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('serials')
  @ApiOperation({ summary: 'Create serial number' })
  @RequirePermissions('inventory:create')
  async createSerial(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSerialDto,
  ) {
    const data = await this.serialService.create(tenantId, dto);
    return ApiResponse.success(data, 'Serial created');
  }

  @Post('serials/bulk')
  @ApiOperation({ summary: 'Bulk create serial numbers' })
  @RequirePermissions('inventory:create')
  async bulkCreateSerials(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: BulkCreateSerialDto,
  ) {
    const data = await this.serialService.bulkCreate(tenantId, dto.items);
    return ApiResponse.success(data, `${data.created} serials created`);
  }

  @Patch('serials/:id')
  @ApiOperation({ summary: 'Update serial' })
  @RequirePermissions('inventory:update')
  async updateSerial(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSerialDto,
  ) {
    const data = await this.serialService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Serial updated');
  }

  @Patch('serials/:id/status')
  @ApiOperation({ summary: 'Change serial status' })
  @RequirePermissions('inventory:update')
  async changeSerialStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    const data = await this.serialService.changeStatus(tenantId, id, dto.status, dto.customerId, dto.invoiceId);
    return ApiResponse.success(data, 'Status changed');
  }

  // ─── TRANSACTIONS ───

  @Post('transactions')
  @ApiOperation({ summary: 'Record stock transaction' })
  @RequirePermissions('inventory:create')
  async recordTransaction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RecordTransactionDto,
  ) {
    const data = await this.transactionService.record(tenantId, { ...dto, createdById: userId });
    return ApiResponse.success(data, 'Transaction recorded');
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions' })
  @RequirePermissions('inventory:read')
  async listTransactions(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('transactionType') transactionType?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.transactionService.list(tenantId, {
      productId, transactionType, locationId, startDate, endDate,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('transactions/ledger/:productId')
  @ApiOperation({ summary: 'Stock ledger for product' })
  @RequirePermissions('inventory:read')
  async getStockLedger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.transactionService.getLedger(tenantId, productId, { locationId, startDate, endDate });
    return ApiResponse.success(data);
  }

  @Get('transactions/by-serial/:serialId')
  @ApiOperation({ summary: 'Transactions for a serial' })
  @RequirePermissions('inventory:read')
  async getTransactionsBySerial(
    @CurrentUser('tenantId') tenantId: string,
    @Param('serialId', ParseUUIDPipe) serialId: string,
  ) {
    const data = await this.transactionService.getBySerial(tenantId, serialId);
    return ApiResponse.success(data);
  }

  @Post('transactions/transfer')
  @ApiOperation({ summary: 'Transfer stock between locations' })
  @RequirePermissions('inventory:create')
  async transfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TransferDto,
  ) {
    const data = await this.transactionService.transfer(tenantId, { ...dto, createdById: userId });
    return ApiResponse.success(data, 'Transfer completed');
  }

  // ─── STOCK SUMMARY ───

  @Get('stock')
  @ApiOperation({ summary: 'Current stock summary' })
  @RequirePermissions('inventory:read')
  async getStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    const data = await this.inventoryService.getStockSummary(tenantId, { productId, locationId });
    return ApiResponse.success(data);
  }

  @Get('stock/opening-balance')
  @ApiOperation({ summary: 'Opening balance as of date' })
  @RequirePermissions('inventory:read')
  async getOpeningBalance(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId: string,
    @Query('date') date: string,
  ) {
    const data = await this.inventoryService.getOpeningBalance(tenantId, productId, new Date(date));
    return ApiResponse.success(data);
  }

  @Post('stock/recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculate stock from transactions' })
  @RequirePermissions('inventory:update')
  async recalculateStock(
    @CurrentUser('tenantId') tenantId: string,
    @Body('productId') productId: string,
  ) {
    const data = await this.inventoryService.recalculateStock(tenantId, productId);
    return ApiResponse.success(data, 'Stock recalculated');
  }

  // ─── LOCATIONS ───

  @Get('locations')
  @ApiOperation({ summary: 'List stock locations' })
  @RequirePermissions('inventory:read')
  async listLocations(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.locationService.list(tenantId);
    return ApiResponse.success(data);
  }

  @Post('locations')
  @ApiOperation({ summary: 'Create stock location' })
  @RequirePermissions('inventory:create')
  async createLocation(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateLocationDto,
  ) {
    const data = await this.locationService.create(tenantId, dto);
    return ApiResponse.success(data, 'Location created');
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update stock location' })
  @RequirePermissions('inventory:update')
  async updateLocation(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const data = await this.locationService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Location updated');
  }

  // ─── REPORTS ───

  @Get('reports/stock-ledger')
  @ApiOperation({ summary: 'Stock ledger report' })
  @RequirePermissions('inventory:read')
  async stockLedgerReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportService.stockLedger(tenantId, { productId, locationId, startDate, endDate });
    return ApiResponse.success(data);
  }

  @Get('reports/expiry')
  @ApiOperation({ summary: 'Expiry report' })
  @RequirePermissions('inventory:read')
  async expiryReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    const data = await this.reportService.expiryReport(tenantId, days ? parseInt(days) : 30);
    return ApiResponse.success(data);
  }

  @Get('reports/valuation')
  @ApiOperation({ summary: 'Stock valuation report' })
  @RequirePermissions('inventory:read')
  async valuationReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('locationId') locationId?: string,
  ) {
    const data = await this.reportService.valuation(tenantId, { locationId });
    return ApiResponse.success(data);
  }

  @Get('reports/serial-tracking')
  @ApiOperation({ summary: 'Serial tracking report' })
  @RequirePermissions('inventory:read')
  async serialTrackingReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('serialNo') serialNo?: string,
    @Query('productId') productId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.reportService.serialTracking(tenantId, { serialNo, productId, status });
    return ApiResponse.success(data);
  }

  // ─── ADJUSTMENTS ───

  @Post('adjustments')
  @ApiOperation({ summary: 'Create stock adjustment' })
  @RequirePermissions('inventory:create')
  async createAdjustment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdjustmentDto,
  ) {
    const data = await this.adjustmentService.create(tenantId, { ...dto, createdById: userId });
    return ApiResponse.success(data, 'Adjustment created');
  }

  @Patch('adjustments/:id/approve')
  @ApiOperation({ summary: 'Approve/reject adjustment' })
  @RequirePermissions('inventory:update')
  async approveAdjustment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveAdjustmentDto,
  ) {
    const data = await this.adjustmentService.approve(tenantId, id, userId, dto.action);
    return ApiResponse.success(data, `Adjustment ${dto.action}d`);
  }
}
