import {
  Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTemplateCommand } from '../application/commands/create-template/create-template.command';
import { UpdateTemplateCommand } from '../application/commands/update-template/update-template.command';
import { DeleteTemplateCommand } from '../application/commands/delete-template/delete-template.command';
import { GetTemplatesQuery } from '../application/queries/get-templates/query';
import { GetTemplateDetailQuery } from '../application/queries/get-template-detail/query';
import { PreviewTemplateQuery } from '../application/queries/preview-template/query';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, PreviewTemplateDto } from './dto/template.dto';

@ApiTags('Email Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email-templates')
export class EmailTemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('emails:create')
  async create(@Body() dto: CreateTemplateDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateTemplateCommand(
        dto.name, dto.category || 'GENERAL', dto.subject, dto.bodyHtml,
        dto.isShared || false, user.id, user.name || user.email,
        dto.bodyText, dto.variables, dto.description,
      ),
    );
    return ApiResponse.success(result, 'Template created successfully');
  }

  @Put(':id')
  @RequirePermissions('emails:update')
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const result = await this.commandBus.execute(
      new UpdateTemplateCommand(
        id, dto.name, dto.category, dto.subject, dto.bodyHtml,
        dto.bodyText, dto.variables, dto.description, dto.isShared,
      ),
    );
    return ApiResponse.success(result, 'Template updated successfully');
  }

  @Delete(':id')
  @RequirePermissions('emails:delete')
  async delete(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteTemplateCommand(id));
    return ApiResponse.success(null, 'Template deleted successfully');
  }

  @Get()
  @RequirePermissions('emails:read')
  async list(@Query() query: TemplateQueryDto) {
    const result = await this.queryBus.execute(
      new GetTemplatesQuery(1, 50, query.category, query.isShared, query.search),
    );
    return ApiResponse.success(result.data, 'Templates retrieved');
  }

  @Get(':id')
  @RequirePermissions('emails:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetTemplateDetailQuery(id));
    return ApiResponse.success(result, 'Template retrieved');
  }

  @Post(':id/preview')
  @RequirePermissions('emails:read')
  async preview(@Param('id') id: string, @Body() dto: PreviewTemplateDto) {
    const result = await this.queryBus.execute(new PreviewTemplateQuery(id, dto.sampleData));
    return ApiResponse.success(result, 'Template preview generated');
  }
}
