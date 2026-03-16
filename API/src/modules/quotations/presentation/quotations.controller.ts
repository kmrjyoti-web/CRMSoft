import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { AddLineItemDto } from './dto/add-line-item.dto';
import { SendQuotationDto } from './dto/send-quotation.dto';
import { LogNegotiationDto } from './dto/log-negotiation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { CreateQuotationCommand } from '../application/commands/create-quotation/create-quotation.command';
import { UpdateQuotationCommand } from '../application/commands/update-quotation/update-quotation.command';
import { AddLineItemCommand } from '../application/commands/add-line-item/add-line-item.command';
import { UpdateLineItemCommand } from '../application/commands/update-line-item/update-line-item.command';
import { RemoveLineItemCommand } from '../application/commands/remove-line-item/remove-line-item.command';
import { RecalculateTotalsCommand } from '../application/commands/recalculate-totals/recalculate-totals.command';
import { SendQuotationCommand } from '../application/commands/send-quotation/send-quotation.command';
import { MarkViewedCommand } from '../application/commands/mark-viewed/mark-viewed.command';
import { AcceptQuotationCommand } from '../application/commands/accept-quotation/accept-quotation.command';
import { RejectQuotationCommand } from '../application/commands/reject-quotation/reject-quotation.command';
import { ReviseQuotationCommand } from '../application/commands/revise-quotation/revise-quotation.command';
import { CancelQuotationCommand } from '../application/commands/cancel-quotation/cancel-quotation.command';
import { CloneQuotationCommand } from '../application/commands/clone-quotation/clone-quotation.command';
import { LogNegotiationCommand } from '../application/commands/log-negotiation/log-negotiation.command';
import { GetQuotationByIdQuery } from '../application/queries/get-quotation-by-id/get-quotation-by-id.query';
import { ListQuotationsQuery } from '../application/queries/list-quotations/list-quotations.query';
import { GetQuotationTimelineQuery } from '../application/queries/get-quotation-timeline/get-quotation-timeline.query';
import { GetQuotationVersionsQuery } from '../application/queries/get-quotation-versions/get-quotation-versions.query';
import { GetNegotiationHistoryQuery } from '../application/queries/get-negotiation-history/get-negotiation-history.query';

@Controller('quotations')
@UseGuards(AuthGuard('jwt'))
export class QuotationsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('quotations:create')
  async create(@Body() dto: CreateQuotationDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new CreateQuotationCommand(
      user.id, `${user.firstName} ${user.lastName}`, user.tenantId, dto.leadId, dto.contactPersonId, dto.organizationId,
      dto.title, dto.summary, dto.coverNote, dto.priceType, dto.minAmount, dto.maxAmount, dto.plusMinusPercent,
      dto.validFrom ? new Date(dto.validFrom) : undefined, dto.validUntil ? new Date(dto.validUntil) : undefined,
      dto.paymentTerms, dto.deliveryTerms, dto.warrantyTerms, dto.termsConditions,
      dto.discountType, dto.discountValue, dto.items, dto.tags, dto.internalNotes,
    ));
    return ApiResponse.success(result, 'Quotation created');
  }

  @Get()
  @RequirePermissions('quotations:read')
  async list(@Query() query: QuotationQueryDto) {
    const result = await this.queryBus.execute(new ListQuotationsQuery(
      query.page, query.limit, query.sortBy, query.sortOrder, query.search,
      query.status, query.leadId, query.userId,
      query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined,
    ));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('quotations:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetQuotationByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('quotations:update')
  async update(@Param('id') id: string, @Body() dto: UpdateQuotationDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new UpdateQuotationCommand(
      id, user.id, `${user.firstName} ${user.lastName}`,
      dto.title, dto.summary, dto.coverNote, dto.priceType, dto.minAmount, dto.maxAmount, dto.plusMinusPercent,
      dto.validFrom ? new Date(dto.validFrom) : undefined, dto.validUntil ? new Date(dto.validUntil) : undefined,
      dto.paymentTerms, dto.deliveryTerms, dto.warrantyTerms, dto.termsConditions,
      dto.discountType, dto.discountValue, dto.tags, dto.internalNotes,
    ));
    return ApiResponse.success(result, 'Quotation updated');
  }

  @Delete(':id')
  @RequirePermissions('quotations:delete')
  async cancel(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason?: string) {
    const result = await this.commandBus.execute(new CancelQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, reason));
    return ApiResponse.success(result, 'Quotation cancelled');
  }

  @Post(':id/items')
  @RequirePermissions('quotations:update')
  async addItem(@Param('id') id: string, @Body() dto: AddLineItemDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new AddLineItemCommand(
      id, user.id, `${user.firstName} ${user.lastName}`,
      dto.productId, dto.productName, dto.description, dto.quantity, dto.unit,
      dto.unitPrice, dto.mrp, dto.discountType, dto.discountValue, dto.gstRate, dto.cessRate, dto.isOptional, dto.notes,
    ));
    return ApiResponse.success(result, 'Item added');
  }

  @Put(':id/items/:itemId')
  @RequirePermissions('quotations:update')
  async updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: AddLineItemDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new UpdateLineItemCommand(
      id, itemId, user.id, `${user.firstName} ${user.lastName}`,
      dto.productName, dto.description, dto.quantity, dto.unit, dto.unitPrice,
      dto.discountType, dto.discountValue, dto.gstRate, dto.cessRate, dto.isOptional, dto.notes,
    ));
    return ApiResponse.success(result, 'Item updated');
  }

  @Delete(':id/items/:itemId')
  @RequirePermissions('quotations:update')
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new RemoveLineItemCommand(id, itemId, user.id, `${user.firstName} ${user.lastName}`));
    return ApiResponse.success(result, 'Item removed');
  }

  @Post(':id/recalculate')
  @RequirePermissions('quotations:update')
  async recalculate(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new RecalculateTotalsCommand(id, user.id, `${user.firstName} ${user.lastName}`));
    return ApiResponse.success(result, 'Totals recalculated');
  }

  @Post(':id/send')
  @RequirePermissions('quotations:update')
  async send(@Param('id') id: string, @Body() dto: SendQuotationDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new SendQuotationCommand(
      id, user.id, `${user.firstName} ${user.lastName}`, dto.channel,
      dto.receiverContactId, dto.receiverEmail, dto.receiverPhone, dto.message,
    ));
    return ApiResponse.success(result, 'Quotation sent');
  }

  @Post(':id/mark-viewed')
  async markViewed(@Param('id') id: string, @Body('sendLogId') sendLogId?: string) {
    const result = await this.commandBus.execute(new MarkViewedCommand(id, sendLogId));
    return ApiResponse.success(result, 'Marked as viewed');
  }

  @Post(':id/accept')
  @RequirePermissions('quotations:update')
  async accept(@Param('id') id: string, @CurrentUser() user: any, @Body('note') note?: string) {
    const result = await this.commandBus.execute(new AcceptQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, note));
    return ApiResponse.success(result, 'Quotation accepted');
  }

  @Post(':id/reject')
  @RequirePermissions('quotations:update')
  async reject(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason?: string) {
    const result = await this.commandBus.execute(new RejectQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, reason));
    return ApiResponse.success(result, 'Quotation rejected');
  }

  @Post(':id/revise')
  @RequirePermissions('quotations:create')
  async revise(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new ReviseQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`));
    return ApiResponse.success(result, 'Revision created');
  }

  @Post(':id/clone')
  @RequirePermissions('quotations:create')
  async clone(@Param('id') id: string, @CurrentUser() user: any, @Body('leadId') leadId?: string) {
    const result = await this.commandBus.execute(new CloneQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, leadId));
    return ApiResponse.success(result, 'Quotation cloned');
  }

  @Post(':id/negotiations')
  @RequirePermissions('quotations:update')
  async logNegotiation(@Param('id') id: string, @Body() dto: LogNegotiationDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new LogNegotiationCommand(
      id, user.id, `${user.firstName} ${user.lastName}`, dto.negotiationType,
      dto.customerRequirement, dto.customerBudget, dto.customerPriceExpected,
      dto.ourPrice, dto.proposedDiscount, dto.counterOfferAmount,
      dto.itemsAdded, dto.itemsRemoved, dto.itemsModified,
      dto.termsChanged, dto.note, dto.outcome, dto.contactPersonId, dto.contactPersonName,
    ));
    return ApiResponse.success(result, 'Negotiation logged');
  }

  @Get(':id/negotiations')
  @RequirePermissions('quotations:read')
  async getNegotiations(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetNegotiationHistoryQuery(id));
    return ApiResponse.success(result);
  }

  @Get(':id/timeline')
  @RequirePermissions('quotations:read')
  async getTimeline(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetQuotationTimelineQuery(id));
    return ApiResponse.success(result);
  }

  @Get(':id/versions')
  @RequirePermissions('quotations:read')
  async getVersions(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetQuotationVersionsQuery(id));
    return ApiResponse.success(result);
  }
}
