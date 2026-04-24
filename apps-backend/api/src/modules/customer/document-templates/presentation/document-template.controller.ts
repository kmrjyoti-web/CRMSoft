import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TemplateCrudService } from '../services/template-crud.service';
import { TemplateCustomizationService } from '../services/template-customization.service';
import { TemplateQueryDto, CustomizeTemplateDto } from './dto/document-template.dto';

@ApiTags('Document Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-templates')
export class DocumentTemplateController {
  constructor(
    private readonly crudService: TemplateCrudService,
    private readonly customizationService: TemplateCustomizationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List templates available for tenant' })
  async list(
    @CurrentUser() user: any,
    @Query() query: TemplateQueryDto,
  ) {
    const templates = await this.crudService.findAll({
      documentType: query.documentType as any,
      industryCode: query.industryCode || user.businessTypeCode,
      isActive: true,
    });
    return ApiResponse.success(templates);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get templates filtered by document type' })
  async getByType(
    @CurrentUser() user: any,
    @Param('type') type: string,
  ) {
    const templates = await this.crudService.findByType(
      type,
      user.tenantId,
      user.businessTypeCode,
    );
    return ApiResponse.success(templates);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template detail' })
  async getById(@Param('id') id: string) {
    const template = await this.crudService.findById(id);
    return ApiResponse.success(template);
  }

  @Post('customize/:id')
  @ApiOperation({ summary: 'Save tenant customization for a template' })
  @RequirePermissions('settings:update')
  async customize(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CustomizeTemplateDto,
  ) {
    const result = await this.customizationService.saveCustomization(
      user.tenantId,
      id,
      dto,
    );
    return ApiResponse.success(result, 'Template customization saved');
  }

  @Get(':id/customization')
  @ApiOperation({ summary: "Get tenant's customization for a template" })
  async getCustomization(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const customization = await this.customizationService.getCustomization(
      user.tenantId,
      id,
    );
    return ApiResponse.success(customization);
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set template as default for its document type' })
  @RequirePermissions('settings:update')
  async setDefault(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const template = await this.crudService.findById(id);
    const result = await this.crudService.setDefault(
      id,
      user.tenantId,
      template.documentType,
    );
    return ApiResponse.success(result, 'Default template updated');
  }
}
