import {
  Controller, Get, Post, Put, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { GoogleService } from './google.service';

@ApiTags('Google')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  // ── Auth ──────────────────────────────────────────────────

  @Post('auth/initiate')
  async initiateAuth(
    @Body() body: { services: string[] },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const authUrl = await this.googleService.getAuthUrl(tenantId, userId, body.services);
    return ApiResponse.success({ authUrl }, 'Google auth URL generated');
  }

  @Post('auth/callback')
  async handleCallback(
    @Body() body: { code: string; services: string[] },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.googleService.handleCallback(
      tenantId, userId, body.code, body.services,
    );
    return ApiResponse.success(result, 'Google account connected');
  }

  // ── Status & Disconnect ───────────────────────────────────

  @Get('status')
  async getStatus(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const status = await this.googleService.getStatus(tenantId, userId);
    return ApiResponse.success(status, 'Connection status retrieved');
  }

  @Post('disconnect')
  async disconnect(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.googleService.disconnect(tenantId, userId);
    return ApiResponse.success(result, 'Google account disconnected');
  }

  // ── Sync ──────────────────────────────────────────────────

  @Post('sync/:service')
  async syncService(
    @Param('service') service: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.googleService.syncService(tenantId, userId, service);
    return ApiResponse.success(result, `${service} sync completed`);
  }

  // ── Calendar Settings ─────────────────────────────────────

  @Get('settings/calendar')
  async getCalendarSettings(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const settings = await this.googleService.getCalendarSettings(tenantId, userId);
    return ApiResponse.success(settings, 'Calendar settings retrieved');
  }

  @Put('settings/calendar')
  async updateCalendarSettings(
    @Body() body: { syncDirection: string; syncFrequencyMinutes: number },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const settings = await this.googleService.updateCalendarSettings(tenantId, userId, body);
    return ApiResponse.success(settings, 'Calendar settings updated');
  }

  // ── Contacts Settings ─────────────────────────────────────

  @Get('settings/contacts')
  async getContactsSettings(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const settings = await this.googleService.getContactsSettings(tenantId, userId);
    return ApiResponse.success(settings, 'Contacts settings retrieved');
  }

  @Put('settings/contacts')
  async updateContactsSettings(
    @Body() body: { syncDirection: string; conflictResolution: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const settings = await this.googleService.updateContactsSettings(tenantId, userId, body);
    return ApiResponse.success(settings, 'Contacts settings updated');
  }
}
