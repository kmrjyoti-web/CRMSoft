import {
  Controller, Get, Post, Put, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProformaInvoiceService } from '../services/proforma-invoice.service';
import {
  CreateProformaInvoiceDto,
  UpdateProformaInvoiceDto,
  ProformaInvoiceQueryDto,
  GenerateProformaFromQuotationDto,
  CancelProformaDto,
} from './dto/proforma-invoice.dto';

@ApiTags('Proforma Invoices')
@Controller('proforma-invoices')
export class ProformaInvoiceController {
  constructor(private readonly proformaService: ProformaInvoiceService) {}

  /** Generate proforma invoice from quotation */
  @Post('generate')
  generate(@Req() req: any, @Body() dto: GenerateProformaFromQuotationDto) {
    return this.proformaService.generateFromQuotation(req.user.tenantId, dto, req.user.id);
  }

  /** Create proforma invoice manually */
  @Post()
  create(@Req() req: any, @Body() dto: CreateProformaInvoiceDto) {
    return this.proformaService.create(req.user.tenantId, dto, req.user.id);
  }

  /** List proforma invoices */
  @Get()
  list(@Req() req: any, @Query() query: ProformaInvoiceQueryDto) {
    return this.proformaService.list(req.user.tenantId, query);
  }

  /** Get single proforma invoice */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.proformaService.getById(req.user.tenantId, id);
  }

  /** Update draft proforma invoice */
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProformaInvoiceDto) {
    return this.proformaService.update(req.user.tenantId, id, dto);
  }

  /** Send proforma invoice */
  @Post(':id/send')
  send(@Req() req: any, @Param('id') id: string) {
    return this.proformaService.send(req.user.tenantId, id);
  }

  /** Convert proforma invoice to final invoice */
  @Post(':id/convert')
  convert(@Req() req: any, @Param('id') id: string) {
    return this.proformaService.convertToInvoice(req.user.tenantId, id, req.user.id);
  }

  /** Cancel proforma invoice */
  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelProformaDto) {
    return this.proformaService.cancel(req.user.tenantId, id, dto.reason, req.user.id);
  }
}
