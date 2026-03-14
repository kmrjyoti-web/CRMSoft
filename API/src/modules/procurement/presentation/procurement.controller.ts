import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { UnitService } from '../services/unit.service';
import { RFQService } from '../services/rfq.service';
import { PurchaseQuotationService } from '../services/purchase-quotation.service';
import { CompareEngineService } from '../services/compare-engine.service';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { GoodsReceiptService } from '../services/goods-receipt.service';
import { PurchaseInvoiceService } from '../services/purchase-invoice.service';
import { ProcurementDashboardService } from '../services/procurement-dashboard.service';
import {
  CreateUnitDto, UpdateUnitDto, CreateUnitConversionDto, CalculateConversionDto,
  CreateRFQDto, UpdateRFQDto,
  CreatePurchaseQuotationDto,
  CompareQuotationsDto, SelectWinnerDto,
  CreatePODto, UpdatePODto,
  CreateGRNDto,
  CreatePurchaseInvoiceDto,
  WorkflowActionDto,
} from './dto/procurement.dto';

@ApiTags('Procurement')
@ApiBearerAuth()
@Controller('procurement')
export class ProcurementController {
  constructor(
    private readonly unitService: UnitService,
    private readonly rfqService: RFQService,
    private readonly quotationService: PurchaseQuotationService,
    private readonly compareEngine: CompareEngineService,
    private readonly poService: PurchaseOrderService,
    private readonly grnService: GoodsReceiptService,
    private readonly invoiceService: PurchaseInvoiceService,
    private readonly dashboardService: ProcurementDashboardService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════

  @Get('dashboard')
  @ApiOperation({ summary: 'Procurement dashboard KPIs' })
  @RequirePermissions('procurement:read')
  async getDashboard(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.dashboardService.getDashboard(tenantId);
    return ApiResponse.success(data);
  }

  // ═══════════════════════════════════════════════════════════
  //  UNITS
  // ═══════════════════════════════════════════════════════════

  @Get('units')
  @ApiOperation({ summary: 'List units' })
  @RequirePermissions('procurement:read')
  async listUnits(
    @CurrentUser('tenantId') tenantId: string,
    @Query('category') category?: string,
  ) {
    const data = await this.unitService.list(tenantId, category);
    return ApiResponse.success(data);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Get unit by ID' })
  @RequirePermissions('procurement:read')
  async getUnit(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.unitService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('units')
  @ApiOperation({ summary: 'Create unit' })
  @RequirePermissions('procurement:create')
  async createUnit(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateUnitDto,
  ) {
    const data = await this.unitService.create(tenantId, dto);
    return ApiResponse.success(data, 'Unit created');
  }

  @Patch('units/:id')
  @ApiOperation({ summary: 'Update unit' })
  @RequirePermissions('procurement:update')
  async updateUnit(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    const data = await this.unitService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Unit updated');
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Delete unit' })
  @RequirePermissions('procurement:delete')
  async deleteUnit(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.unitService.delete(tenantId, id);
    return ApiResponse.success(data, 'Unit deleted');
  }

  // ─── Unit Conversions ───

  @Get('unit-conversions')
  @ApiOperation({ summary: 'List unit conversions' })
  @RequirePermissions('procurement:read')
  async listConversions(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
  ) {
    const data = await this.unitService.listConversions(tenantId, productId);
    return ApiResponse.success(data);
  }

  @Post('unit-conversions')
  @ApiOperation({ summary: 'Create unit conversion' })
  @RequirePermissions('procurement:create')
  async createConversion(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateUnitConversionDto,
  ) {
    const data = await this.unitService.createConversion(tenantId, dto);
    return ApiResponse.success(data, 'Conversion created');
  }

  @Delete('unit-conversions/:id')
  @ApiOperation({ summary: 'Delete unit conversion' })
  @RequirePermissions('procurement:delete')
  async deleteConversion(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.unitService.deleteConversion(tenantId, id);
    return ApiResponse.success(data, 'Conversion deleted');
  }

  @Post('unit-conversions/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate unit conversion' })
  @RequirePermissions('procurement:read')
  async calculateConversion(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CalculateConversionDto,
  ) {
    const data = await this.unitService.calculate(tenantId, dto);
    return ApiResponse.success(data);
  }

  // ═══════════════════════════════════════════════════════════
  //  RFQ
  // ═══════════════════════════════════════════════════════════

  @Get('rfq')
  @ApiOperation({ summary: 'List RFQs' })
  @RequirePermissions('procurement:read')
  async listRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.rfqService.list(tenantId, {
      status, page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('rfq/generate-number')
  @ApiOperation({ summary: 'Generate next RFQ number' })
  @RequirePermissions('procurement:read')
  async generateRFQNumber(@CurrentUser('tenantId') tenantId: string) {
    const number = await this.rfqService.generateNumber(tenantId);
    return ApiResponse.success({ number });
  }

  @Get('rfq/:id')
  @ApiOperation({ summary: 'Get RFQ detail' })
  @RequirePermissions('procurement:read')
  async getRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.rfqService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('rfq')
  @ApiOperation({ summary: 'Create RFQ' })
  @RequirePermissions('procurement:create')
  async createRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRFQDto,
  ) {
    const data = await this.rfqService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'RFQ created');
  }

  @Patch('rfq/:id')
  @ApiOperation({ summary: 'Update RFQ' })
  @RequirePermissions('procurement:update')
  async updateRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRFQDto,
  ) {
    const data = await this.rfqService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'RFQ updated');
  }

  @Post('rfq/:id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send RFQ to vendors' })
  @RequirePermissions('procurement:update')
  async sendRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('vendorIds') vendorIds: string[],
  ) {
    const data = await this.rfqService.sendToVendors(tenantId, id, vendorIds);
    return ApiResponse.success(data, 'RFQ sent to vendors');
  }

  @Post('rfq/:id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close RFQ' })
  @RequirePermissions('procurement:update')
  async closeRFQ(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.rfqService.close(tenantId, id);
    return ApiResponse.success(data, 'RFQ closed');
  }

  // ═══════════════════════════════════════════════════════════
  //  PURCHASE QUOTATIONS
  // ═══════════════════════════════════════════════════════════

  @Get('quotations')
  @ApiOperation({ summary: 'List purchase quotations' })
  @RequirePermissions('procurement:read')
  async listQuotations(
    @CurrentUser('tenantId') tenantId: string,
    @Query('rfqId') rfqId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.quotationService.list(tenantId, {
      rfqId, vendorId, status,
      page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('quotations/generate-number')
  @ApiOperation({ summary: 'Generate next quotation number' })
  @RequirePermissions('procurement:read')
  async generateQuotationNumber(@CurrentUser('tenantId') tenantId: string) {
    const number = await this.quotationService.generateNumber(tenantId);
    return ApiResponse.success({ number });
  }

  @Get('quotations/:id')
  @ApiOperation({ summary: 'Get purchase quotation detail' })
  @RequirePermissions('procurement:read')
  async getQuotation(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.quotationService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('quotations')
  @ApiOperation({ summary: 'Create purchase quotation' })
  @RequirePermissions('procurement:create')
  async createQuotation(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseQuotationDto,
  ) {
    const data = await this.quotationService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Quotation created');
  }

  // ═══════════════════════════════════════════════════════════
  //  COMPARE ENGINE
  // ═══════════════════════════════════════════════════════════

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compare quotations for an RFQ' })
  @RequirePermissions('procurement:read')
  async compareQuotations(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CompareQuotationsDto,
  ) {
    const data = await this.compareEngine.compareQuotations(tenantId, dto.rfqId, {
      priceWeight: dto.priceWeight,
      deliveryWeight: dto.deliveryWeight,
      creditWeight: dto.creditWeight,
      qualityWeight: dto.qualityWeight,
    });
    return ApiResponse.success(data);
  }

  @Get('compare/:id')
  @ApiOperation({ summary: 'Get comparison result' })
  @RequirePermissions('procurement:read')
  async getComparison(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.compareEngine.getComparison(tenantId, id);
    return ApiResponse.success(data);
  }

  @Get('compare/rfq/:rfqId')
  @ApiOperation({ summary: 'List comparisons for RFQ' })
  @RequirePermissions('procurement:read')
  async listComparisons(
    @CurrentUser('tenantId') tenantId: string,
    @Param('rfqId', ParseUUIDPipe) rfqId: string,
  ) {
    const data = await this.compareEngine.listByRfq(tenantId, rfqId);
    return ApiResponse.success(data);
  }

  @Post('compare/select-winner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select winning quotation' })
  @RequirePermissions('procurement:update')
  async selectWinner(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: SelectWinnerDto,
  ) {
    const data = await this.compareEngine.selectWinner(tenantId, dto.comparisonId, dto.quotationId, dto.remarks);
    return ApiResponse.success(data, 'Winner selected');
  }

  // ═══════════════════════════════════════════════════════════
  //  PURCHASE ORDERS
  // ═══════════════════════════════════════════════════════════

  @Get('purchase-orders')
  @ApiOperation({ summary: 'List purchase orders' })
  @RequirePermissions('procurement:read')
  async listPOs(
    @CurrentUser('tenantId') tenantId: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.poService.list(tenantId, {
      vendorId, status,
      page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('purchase-orders/generate-number')
  @ApiOperation({ summary: 'Generate next PO number' })
  @RequirePermissions('procurement:read')
  async generatePONumber(@CurrentUser('tenantId') tenantId: string) {
    const number = await this.poService.generateNumber(tenantId);
    return ApiResponse.success({ number });
  }

  @Get('purchase-orders/:id')
  @ApiOperation({ summary: 'Get purchase order detail' })
  @RequirePermissions('procurement:read')
  async getPO(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.poService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create purchase order' })
  @RequirePermissions('procurement:create')
  async createPO(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePODto,
  ) {
    const data = await this.poService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Purchase order created');
  }

  @Patch('purchase-orders/:id')
  @ApiOperation({ summary: 'Update purchase order' })
  @RequirePermissions('procurement:update')
  async updatePO(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePODto,
  ) {
    const data = await this.poService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Purchase order updated');
  }

  @Post('purchase-orders/:id/workflow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PO workflow action (submit/approve/reject/cancel)' })
  @RequirePermissions('procurement:update')
  async poWorkflowAction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WorkflowActionDto,
  ) {
    let data;
    switch (dto.action) {
      case 'submit':
        data = await this.poService.submitForApproval(tenantId, id);
        break;
      case 'approve':
        data = await this.poService.approve(tenantId, id, userId);
        break;
      case 'reject':
        data = await this.poService.reject(tenantId, id, userId, dto.remarks);
        break;
      case 'cancel':
        data = await this.poService.cancel(tenantId, id);
        break;
    }
    return ApiResponse.success(data, `Purchase order ${dto.action}d`);
  }

  // ═══════════════════════════════════════════════════════════
  //  GOODS RECEIPT (GRN/CHALLAN)
  // ═══════════════════════════════════════════════════════════

  @Get('goods-receipts')
  @ApiOperation({ summary: 'List goods receipts' })
  @RequirePermissions('procurement:read')
  async listGRN(
    @CurrentUser('tenantId') tenantId: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.grnService.list(tenantId, {
      purchaseOrderId, status,
      page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('goods-receipts/generate-number')
  @ApiOperation({ summary: 'Generate next GRN number' })
  @RequirePermissions('procurement:read')
  async generateGRNNumber(@CurrentUser('tenantId') tenantId: string) {
    const number = await this.grnService.generateNumber(tenantId);
    return ApiResponse.success({ number });
  }

  @Get('goods-receipts/:id')
  @ApiOperation({ summary: 'Get goods receipt detail' })
  @RequirePermissions('procurement:read')
  async getGRN(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.grnService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('goods-receipts')
  @ApiOperation({ summary: 'Create goods receipt' })
  @RequirePermissions('procurement:create')
  async createGRN(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGRNDto,
  ) {
    const data = await this.grnService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Goods receipt created');
  }

  @Post('goods-receipts/:id/workflow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GRN workflow action (accept/reject)' })
  @RequirePermissions('procurement:update')
  async grnWorkflowAction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WorkflowActionDto,
  ) {
    let data;
    switch (dto.action) {
      case 'approve':
        data = await this.grnService.accept(tenantId, id, userId);
        break;
      case 'reject':
        data = await this.grnService.reject(tenantId, id, userId, dto.remarks);
        break;
      default:
        data = await this.grnService.accept(tenantId, id, userId);
    }
    return ApiResponse.success(data, `GRN ${dto.action}d`);
  }

  // ═══════════════════════════════════════════════════════════
  //  PURCHASE INVOICES
  // ═══════════════════════════════════════════════════════════

  @Get('invoices')
  @ApiOperation({ summary: 'List purchase invoices' })
  @RequirePermissions('procurement:read')
  async listInvoices(
    @CurrentUser('tenantId') tenantId: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.invoiceService.list(tenantId, {
      vendorId, status, purchaseOrderId,
      page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('invoices/generate-number')
  @ApiOperation({ summary: 'Generate next invoice number' })
  @RequirePermissions('procurement:read')
  async generateInvoiceNumber(@CurrentUser('tenantId') tenantId: string) {
    const number = await this.invoiceService.generateNumber(tenantId);
    return ApiResponse.success({ number });
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get purchase invoice detail' })
  @RequirePermissions('procurement:read')
  async getInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.invoiceService.getById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create purchase invoice' })
  @RequirePermissions('procurement:create')
  async createInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    const data = await this.invoiceService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Purchase invoice created');
  }

  @Post('invoices/:id/workflow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invoice workflow action (submit/approve/reject/cancel)' })
  @RequirePermissions('procurement:update')
  async invoiceWorkflowAction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WorkflowActionDto,
  ) {
    let data;
    switch (dto.action) {
      case 'submit':
        data = await this.invoiceService.submitForApproval(tenantId, id);
        break;
      case 'approve':
        data = await this.invoiceService.approve(tenantId, id, userId);
        break;
      case 'reject':
        data = await this.invoiceService.reject(tenantId, id, userId, dto.remarks);
        break;
      case 'cancel':
        data = await this.invoiceService.cancel(tenantId, id);
        break;
    }
    return ApiResponse.success(data, `Invoice ${dto.action}d`);
  }
}
