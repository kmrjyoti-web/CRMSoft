import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CalendarSyncService } from '../calendar-sync.service';

@Controller('calendar/sync')
export class CalendarSyncController {
  constructor(private readonly syncService: CalendarSyncService) {}

  /**
   * Connect an external calendar provider (Google / Outlook).
   */
  @Post('connect')
  @RequirePermissions('calendar:sync')
  async connect(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body()
    body: {
      provider: 'GOOGLE' | 'OUTLOOK';
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      calendarId: string;
      externalEmail: string;
    },
  ) {
    const result = await this.syncService.connectProvider(
      userId,
      tenantId,
      body.provider,
      body.accessToken,
      body.refreshToken,
      new Date(body.expiresAt),
      body.calendarId,
      body.externalEmail,
    );
    return ApiResponse.success(result, 'Calendar provider connected');
  }

  /**
   * Disconnect an external calendar provider.
   */
  @Delete(':provider')
  @RequirePermissions('calendar:sync')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Param('provider') provider: 'GOOGLE' | 'OUTLOOK',
  ) {
    await this.syncService.disconnectProvider(userId, tenantId, provider);
    return ApiResponse.success(null, 'Calendar provider disconnected');
  }

  /**
   * Force a sync for a specific provider.
   */
  @Post(':provider/trigger')
  @RequirePermissions('calendar:sync')
  async triggerSync(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Param('provider') provider: 'GOOGLE' | 'OUTLOOK',
  ) {
    const result = await this.syncService.triggerSync(userId, tenantId, provider);
    return ApiResponse.success(result, 'Sync triggered');
  }

  /**
   * Get all sync configurations for the current user.
   */
  @Get('status')
  @RequirePermissions('calendar:read')
  async getSyncStatus(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const syncs = await this.syncService.getSyncStatus(userId, tenantId);
    return ApiResponse.success(syncs);
  }

  /**
   * Webhook handler for external calendar providers.
   * This endpoint is public (no auth) since providers call it directly.
   */
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Param('provider') provider: string,
    @Body() payload: Record<string, any>,
  ) {
    await this.syncService.handleWebhook(provider, payload);
    return ApiResponse.success(null, 'Webhook received');
  }
}
