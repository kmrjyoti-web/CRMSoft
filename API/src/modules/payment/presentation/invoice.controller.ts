import {
  Controller, Get, Post, Put, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoiceService } from '../services/invoice.service';
import {
  CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto,
  GenerateInvoiceDto, CancelInvoiceDto,
} from './dto/invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /** Generate invoice from quotation */
  @Post('generate')
  generate(@Req() req: any, @Body() dto: GenerateInvoiceDto) {
    return this.invoiceService.generateFromQuotation(req.user.tenantId, dto, req.user.id);
  }

  /** Create invoice manually */
  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.user.tenantId, dto, req.user.id);
  }

  /** List invoices */
  @Get()
  list(@Req() req: any, @Query() query: InvoiceQueryDto) {
    return this.invoiceService.list(req.user.tenantId, query);
  }

  /** Get invoice analytics */
  @Get('analytics')
  analytics(@Req() req: any) {
    return this.invoiceService.getAnalytics(req.user.tenantId);
  }

  /** Get single invoice */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.getById(req.user.tenantId, id);
  }

  /** Update draft invoice */
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(req.user.tenantId, id, dto);
  }

  /** Send invoice */
  @Post(':id/send')
  send(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.send(req.user.tenantId, id);
  }

  /** Cancel invoice */
  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelInvoiceDto) {
    return this.invoiceService.cancel(req.user.tenantId, id, dto.reason, req.user.id);
  }
}
