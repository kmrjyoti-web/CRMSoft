import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../../../core/identity/tenant/infrastructure/vendor.guard';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TemplateCrudService } from '../services/template-crud.service';
import { TemplateRendererService } from '../services/template-renderer.service';
import { DocumentDataService } from '../services/document-data.service';
import {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  TemplateQueryDto,
} from './dto/document-template.dto';

@ApiTags('Vendor Document Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/document-templates')
export class VendorDocumentTemplateController {
  constructor(
    private readonly crudService: TemplateCrudService,
    private readonly rendererService: TemplateRendererService,
    private readonly dataService: DocumentDataService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all system templates' })
  async list(@Query() query: TemplateQueryDto) {
    const templates = await this.crudService.findAll({
      documentType: query.documentType as any,
      industryCode: query.industryCode,
      isActive: query.isActive,
      isSystem: query.isSystem,
    });
    return ApiResponse.success(templates);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template detail with HTML' })
  async getById(@Param('id') id: string) {
    const template = await this.crudService.findById(id);
    return ApiResponse.success(template);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new system template' })
  async create(@Body() dto: CreateDocumentTemplateDto) {
    const template = await this.crudService.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      documentType: dto.documentType as any,
      htmlTemplate: dto.htmlTemplate,
      cssStyles: dto.cssStyles,
      defaultSettings: dto.defaultSettings ?? {},
      availableFields: dto.availableFields ?? [],
      industryCode: dto.industryCode,
      sortOrder: dto.sortOrder ?? 0,
      isDefault: dto.isDefault ?? false,
      isSystem: true,
    });
    return ApiResponse.success(template, 'Template created');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing template' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentTemplateDto,
  ) {
    const template = await this.crudService.update(id, dto as any);
    return ApiResponse.success(template, 'Template updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a template (soft delete)' })
  async archive(@Param('id') id: string) {
    const template = await this.crudService.archive(id);
    return ApiResponse.success(template, 'Template archived');
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Clone/duplicate a template' })
  async duplicate(@Param('id') id: string) {
    const template = await this.crudService.duplicate(id);
    return ApiResponse.success(template, 'Template duplicated');
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview template with sample data' })
  async preview(@Param('id') id: string) {
    const template = await this.crudService.findById(id);
    const sampleData = this.dataService.getSampleData(template.documentType);
    const html = await this.rendererService.renderToHtml(id, '', sampleData);
    return ApiResponse.success({ html }, 'Preview rendered');
  }
}
