import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { SaleOrderService } from '../services/sale-order.service';
import { DeliveryChallanService } from '../services/delivery-challan.service';
import { SaleReturnService } from '../services/sale-return.service';
import { CreditNoteEnhancedService } from '../services/credit-note-enhanced.service';
import { DebitNoteService } from '../services/debit-note.service';
import {
  CreateSaleOrderDto,
  UpdateSaleOrderDto,
  CreateDeliveryChallanDto,
  CreateSaleReturnDto,
  InspectReturnDto,
  CreateCreditNoteDto,
  CreateDebitNoteDto,
  AdjustNoteDto,
} from './dto/sales.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(
    private readonly saleOrderService: SaleOrderService,
    private readonly deliveryChallanService: DeliveryChallanService,
    private readonly saleReturnService: SaleReturnService,
    private readonly creditNoteService: CreditNoteEnhancedService,
    private readonly debitNoteService: DebitNoteService,
  ) {}

  // ─── Sale Orders ───────────────────────────────────────────────

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a sale order' })
  async createOrder(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSaleOrderDto,
  ) {
    const data = await this.saleOrderService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Sale order created');
  }

  @Get('orders')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List sale orders' })
  async listOrders(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    const data = await this.saleOrderService.findAll(tenantId, { status, customerId });
    return ApiResponse.success(data);
  }

  @Get('orders/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get sale order by ID' })
  async getOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleOrderService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Patch('orders/:id')
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Update a sale order' })
  async updateOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSaleOrderDto,
  ) {
    const data = await this.saleOrderService.update(tenantId, id, dto);
    return ApiResponse.success(data, 'Sale order updated');
  }

  @Post('orders/:id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Approve a sale order' })
  async approveOrder(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleOrderService.approve(tenantId, userId, id);
    return ApiResponse.success(data, 'Sale order approved');
  }

  @Post('orders/:id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Reject a sale order' })
  async rejectOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    const data = await this.saleOrderService.reject(tenantId, id, reason ?? '');
    return ApiResponse.success(data, 'Sale order rejected');
  }

  @Post('orders/:id/convert-invoice')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Convert sale order to invoice' })
  async convertToInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleOrderService.convertToInvoice(tenantId, userId, id);
    return ApiResponse.success(data, 'Invoice created from sale order');
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Cancel a sale order' })
  async cancelOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleOrderService.cancel(tenantId, id);
    return ApiResponse.success(data, 'Sale order cancelled');
  }

  // ─── Delivery Challans ─────────────────────────────────────────

  @Post('delivery-challans')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a delivery challan' })
  async createChallan(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateDeliveryChallanDto,
  ) {
    const data = await this.deliveryChallanService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Delivery challan created');
  }

  @Get('delivery-challans')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List delivery challans' })
  async listChallans(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('saleOrderId') saleOrderId?: string,
  ) {
    const data = await this.deliveryChallanService.findAll(tenantId, { status, saleOrderId });
    return ApiResponse.success(data);
  }

  @Get('delivery-challans/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get delivery challan by ID' })
  async getChallan(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.deliveryChallanService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('delivery-challans/:id/dispatch')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Dispatch a delivery challan' })
  async dispatchChallan(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.deliveryChallanService.dispatch(tenantId, userId, id);
    return ApiResponse.success(data, 'Delivery challan dispatched');
  }

  @Post('delivery-challans/:id/deliver')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Mark delivery challan as delivered' })
  async deliverChallan(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.deliveryChallanService.deliver(tenantId, id);
    return ApiResponse.success(data, 'Delivery challan marked as delivered');
  }

  @Post('delivery-challans/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Cancel a delivery challan' })
  async cancelChallan(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.deliveryChallanService.cancel(tenantId, id);
    return ApiResponse.success(data, 'Delivery challan cancelled');
  }

  // ─── Sale Returns ──────────────────────────────────────────────

  @Post('returns')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a sale return' })
  async createReturn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSaleReturnDto,
  ) {
    const data = await this.saleReturnService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Sale return created');
  }

  @Get('returns')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List sale returns' })
  async listReturns(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    const data = await this.saleReturnService.findAll(tenantId, { status });
    return ApiResponse.success(data);
  }

  @Get('returns/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get sale return by ID' })
  async getReturn(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleReturnService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('returns/:id/inspect')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Inspect a sale return' })
  async inspectReturn(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InspectReturnDto,
  ) {
    const data = await this.saleReturnService.inspect(tenantId, id, dto);
    return ApiResponse.success(data, 'Sale return inspected');
  }

  @Post('returns/:id/accept')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Accept a sale return' })
  async acceptReturn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleReturnService.accept(tenantId, userId, id);
    return ApiResponse.success(data, 'Sale return accepted');
  }

  @Post('returns/:id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Reject a sale return' })
  async rejectReturn(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.saleReturnService.reject(tenantId, id);
    return ApiResponse.success(data, 'Sale return rejected');
  }

  // ─── Credit Notes ──────────────────────────────────────────────

  @Post('credit-notes')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a credit note' })
  async createCreditNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCreditNoteDto,
  ) {
    const data = await this.creditNoteService.createManual(tenantId, userId, dto);
    return ApiResponse.success(data, 'Credit note created');
  }

  @Get('credit-notes')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List credit notes' })
  async listCreditNotes(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const data = await this.creditNoteService.findAll(tenantId);
    return ApiResponse.success(data);
  }

  @Get('credit-notes/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get credit note by ID' })
  async getCreditNote(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.creditNoteService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('credit-notes/:id/issue')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Issue a credit note' })
  async issueCreditNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.creditNoteService.issue(tenantId, userId, id);
    return ApiResponse.success(data, 'Credit note issued');
  }

  @Post('credit-notes/:id/adjust')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Adjust a credit note' })
  async adjustCreditNote(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustNoteDto,
  ) {
    const data = await this.creditNoteService.adjust(tenantId, id, dto);
    return ApiResponse.success(data, 'Credit note adjusted');
  }

  // ─── Debit Notes ───────────────────────────────────────────────

  @Post('debit-notes')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a debit note' })
  async createDebitNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateDebitNoteDto,
  ) {
    const data = await this.debitNoteService.create(tenantId, userId, dto);
    return ApiResponse.success(data, 'Debit note created');
  }

  @Get('debit-notes')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List debit notes' })
  async listDebitNotes(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const data = await this.debitNoteService.findAll(tenantId);
    return ApiResponse.success(data);
  }

  @Get('debit-notes/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get debit note by ID' })
  async getDebitNote(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.debitNoteService.findById(tenantId, id);
    return ApiResponse.success(data);
  }

  @Post('debit-notes/:id/issue')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:approve')
  @ApiOperation({ summary: 'Issue a debit note' })
  async issueDebitNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.debitNoteService.issue(tenantId, userId, id);
    return ApiResponse.success(data, 'Debit note issued');
  }

  @Post('debit-notes/:id/adjust')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Adjust a debit note' })
  async adjustDebitNote(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustNoteDto,
  ) {
    const data = await this.debitNoteService.adjust(tenantId, id, dto);
    return ApiResponse.success(data, 'Debit note adjusted');
  }
}
