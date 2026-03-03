import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterPushDto } from './dto/register-push.dto';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/create-template.dto';
import { UpdatePreferencesCommand } from '../application/commands/update-preferences/update-preferences.command';
import { RegisterPushCommand } from '../application/commands/register-push/register-push.command';
import { UnregisterPushCommand } from '../application/commands/unregister-push/unregister-push.command';
import { CreateTemplateCommand } from '../application/commands/create-template/create-template.command';
import { UpdateTemplateCommand } from '../application/commands/update-template/update-template.command';
import { GetPreferencesQuery } from '../application/queries/get-preferences/get-preferences.query';
import { GetTemplatesQuery } from '../application/queries/get-templates/get-templates.query';

@Controller('notification-settings')
@UseGuards(JwtAuthGuard)
export class NotificationSettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── PREFERENCES ───

  @Get('preferences')
  @RequirePermissions('notifications:read')
  async getPreferences(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetPreferencesQuery(userId));
    return ApiResponse.success(result);
  }

  @Put('preferences')
  @RequirePermissions('notifications:update')
  async updatePreferences(@Body() dto: UpdatePreferencesDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new UpdatePreferencesCommand(
        userId, dto.channels, dto.categories, dto.quietHoursStart,
        dto.quietHoursEnd, dto.digestFrequency, dto.timezone,
      ),
    );
    return ApiResponse.success(result, 'Preferences updated');
  }

  // ─── PUSH SUBSCRIPTIONS ───

  @Post('push/register')
  @RequirePermissions('notifications:update')
  async registerPush(@Body() dto: RegisterPushDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new RegisterPushCommand(userId, dto.endpoint, dto.p256dh, dto.auth, dto.deviceType),
    );
    return ApiResponse.success(result, 'Push subscription registered');
  }

  @Post('push/unregister')
  @RequirePermissions('notifications:update')
  async unregisterPush(@Body('endpoint') endpoint: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UnregisterPushCommand(userId, endpoint));
    return ApiResponse.success(result, 'Push subscription removed');
  }

  // ─── TEMPLATES (Admin) ───

  @Get('templates')
  @RequirePermissions('notifications:manage-templates')
  async getTemplates(@Query('category') category?: string) {
    const result = await this.queryBus.execute(new GetTemplatesQuery(category));
    return ApiResponse.success(result);
  }

  @Post('templates')
  @RequirePermissions('notifications:manage-templates')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const result = await this.commandBus.execute(
      new CreateTemplateCommand(dto.name, dto.category, dto.subject, dto.body, dto.channels, dto.variables),
    );
    return ApiResponse.success(result, 'Template created');
  }

  @Put('templates/:id')
  @RequirePermissions('notifications:manage-templates')
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const result = await this.commandBus.execute(
      new UpdateTemplateCommand(id, dto.subject, dto.body, dto.channels, dto.variables),
    );
    return ApiResponse.success(result, 'Template updated');
  }
}
