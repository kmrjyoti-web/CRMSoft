import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TemplateRendererService } from '../services/template-renderer.service';
import { DocumentDataService } from '../services/document-data.service';
import { RenderDocumentDto, BulkRenderDto } from './dto/document-template.dto';

@ApiTags('Document Rendering')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentRenderController {
  constructor(
    private readonly rendererService: TemplateRendererService,
    private readonly dataService: DocumentDataService,
  ) {}

  @Post('preview')
  @ApiOperation({ summary: 'Render document to HTML preview' })
  async preview(
    @CurrentUser() user: any,
    @Body() dto: RenderDocumentDto,
  ) {
    const data = await this.getDataForType(dto.documentType, dto.documentId, user.tenantId);
    const html = await this.rendererService.renderToHtml(dto.templateId, user.tenantId, data);
    return ApiResponse.success({ html }, 'Preview rendered');
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Render document to PDF' })
  async generatePdf(
    @CurrentUser() user: any,
    @Body() dto: RenderDocumentDto,
    @Res() res: Response,
  ) {
    const data = await this.getDataForType(dto.documentType, dto.documentId, user.tenantId);
    const buffer = await this.rendererService.renderToPdf(dto.templateId, user.tenantId, data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dto.documentType}-${dto.documentId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('pdf/bulk')
  @ApiOperation({ summary: 'Bulk PDF generation' })
  async bulkPdf(
    @CurrentUser() user: any,
    @Body() dto: BulkRenderDto,
    @Res() res: Response,
  ) {
    const buffers: Buffer[] = [];
    for (const docId of dto.documentIds) {
      const data = await this.getDataForType(dto.documentType, docId, user.tenantId);
      const buf = await this.rendererService.renderToPdf(dto.templateId, user.tenantId, data);
      buffers.push(buf);
    }
    // For simplicity, return the first PDF (full zip implementation can be added later)
    const buffer = buffers[0] ?? Buffer.alloc(0);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dto.documentType}-bulk.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('data/:type/:id')
  @ApiOperation({ summary: 'Get document data for rendering' })
  async getDocumentData(
    @CurrentUser() user: any,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    const data = await this.getDataForType(type, id, user.tenantId);
    return ApiResponse.success(data);
  }

  @Get('sample-data/:type')
  @ApiOperation({ summary: 'Get sample data for template preview' })
  async getSampleData(@Param('type') type: string) {
    const data = this.dataService.getSampleData(type);
    return ApiResponse.success(data);
  }

  private async getDataForType(type: string, id: string, tenantId: string) {
    // Use sample data for preview mode
    if (id === 'sample' || id === 'preview') {
      return this.dataService.getSampleData(type);
    }

    switch (type.toUpperCase()) {
      case 'GST_INVOICE':
      case 'PROFORMA_INVOICE':
      case 'RECEIPT':
      case 'CREDIT_NOTE':
      case 'DEBIT_NOTE':
        return this.dataService.getInvoiceData(id, tenantId);
      case 'QUOTATION':
        return this.dataService.getQuotationData(id, tenantId);
      default:
        return this.dataService.getSampleData(type);
    }
  }
}
