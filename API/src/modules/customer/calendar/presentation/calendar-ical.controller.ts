import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ICalService } from '../services/ical.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('calendar/ical')
export class CalendarICalController {
  constructor(
    private readonly icalService: ICalService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Export calendar events as .ics file.
   * Content-Type: text/calendar
   */
  @Get('export')
  @RequirePermissions('calendar:read')
  async exportIcal(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 3600000);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 3600000);

    const icsContent = await this.icalService.exportToIcs(userId, tenantId, start, end);

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="calendar.ics"',
    });
    res.send(icsContent);
  }

  /**
   * Import events from an iCalendar (.ics) string.
   */
  @Post('import')
  @RequirePermissions('calendar:create')
  @HttpCode(HttpStatus.OK)
  async importIcal(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { icsContent: string },
  ) {
    const count = await this.icalService.importFromIcs(body.icsContent, userId, tenantId);
    return ApiResponse.success({ imported: count }, `Imported ${count} events`);
  }

  /**
   * Public iCal feed endpoint (no auth, token-based access).
   * Allows calendar apps (Apple Calendar, Thunderbird, etc.) to subscribe.
   */
  @Get('feed/:token')
  async publicFeed(@Param('token') token: string, @Res() res: Response) {
    // Look up the sync record by token (stored as calendarId for ICAL provider)
    const sync = await this.prisma.userCalendarSync.findFirst({
      where: {
        provider: 'ICAL',
        calendarId: token,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    if (!sync) {
      throw new NotFoundException('Invalid or expired feed token');
    }

    const start = new Date(Date.now() - 30 * 24 * 3600000);
    const end = new Date(Date.now() + 180 * 24 * 3600000);

    const icsContent = await this.icalService.exportToIcs(
      sync.userId,
      sync.tenantId,
      start,
      end,
    );

    // Update last sync timestamp
    await this.prisma.userCalendarSync.update({
      where: { id: sync.id },
      data: { lastSyncAt: new Date() },
    });

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.send(icsContent);
  }

  /**
   * Generate a new iCal feed token for the current user.
   * Creates a UserCalendarSync record for the ICAL provider.
   */
  @Post('feed/generate')
  @RequirePermissions('calendar:sync')
  @HttpCode(HttpStatus.OK)
  async generateFeedToken(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const token = this.icalService.generateFeedToken(userId, tenantId);

    // Store the token as calendarId in UserCalendarSync for ICAL provider
    await this.prisma.userCalendarSync.upsert({
      where: {
        tenantId_userId_provider: { tenantId, userId, provider: 'ICAL' },
      },
      update: { calendarId: token, status: 'ACTIVE', isActive: true },
      create: {
        tenantId,
        userId,
        provider: 'ICAL',
        direction: 'ONE_WAY_FROM_CRM',
        calendarId: token,
        status: 'ACTIVE',
      },
    });

    return ApiResponse.success(
      { token, feedUrl: `/api/v1/calendar/ical/feed/${token}` },
      'Feed token generated',
    );
  }
}
