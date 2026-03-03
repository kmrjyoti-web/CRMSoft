import {
  Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateTemplateCommand } from '../application/commands/create-template/create-template.command';
import { UpdateTemplateCommand } from '../application/commands/update-template/update-template.command';
import { DeleteTemplateCommand } from '../application/commands/delete-template/delete-template.command';
import { SyncTemplatesCommand } from '../application/commands/sync-templates/sync-templates.command';
import { GetTemplatesQuery } from '../application/queries/get-templates/query';
import { GetTemplateDetailQuery } from '../application/queries/get-template-detail/query';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto } from './dto/template.dto';

@ApiTags('WhatsApp Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp/templates')
export class WhatsAppTemplatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('whatsapp:manage')
  async create(@Body() dto: CreateTemplateDto) {
    const result = await this.commandBus.execute(
      new CreateTemplateCommand(
        dto.wabaId, dto.name, dto.language || 'en', dto.category,
        dto.headerType, dto.headerContent, dto.bodyText, dto.footerText,
        dto.buttons, dto.variables, dto.sampleValues,
      ),
    );
    return ApiResponse.success(result, 'Template created');
  }

  @Put(':id')
  @RequirePermissions('whatsapp:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const result = await this.commandBus.execute(
      new UpdateTemplateCommand(id, dto.name, dto.bodyText, dto.footerText, dto.buttons),
    );
    return ApiResponse.success(result, 'Template updated');
  }

  @Delete(':id')
  @RequirePermissions('whatsapp:manage')
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteTemplateCommand(id));
    return ApiResponse.success(null, 'Template deleted');
  }

  @Get()
  @RequirePermissions('whatsapp:read')
  async list(@Query() dto: TemplateQueryDto) {
    const result = await this.queryBus.execute(
      new GetTemplatesQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status, dto.category),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('whatsapp:read')
  async detail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetTemplateDetailQuery(id));
    return ApiResponse.success(result);
  }

  @Post('sync')
  @RequirePermissions('whatsapp:manage')
  async sync(@Body('wabaId') wabaId: string) {
    const result = await this.commandBus.execute(new SyncTemplatesCommand(wabaId));
    return ApiResponse.success(result, 'Templates synced from Meta');
  }
}
