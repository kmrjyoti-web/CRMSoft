import {
  Controller, Get, Put, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { DailyDigestSettingsDto } from './dto/daily-digest-settings.dto';

/**
 * Controller for the daily digest report.
 * Provides an endpoint to view today's digest and to configure
 * automatic email delivery settings (recipients, time, format).
 */
@Controller('mis-reports/daily-digest')
@UseGuards(AuthGuard('jwt'))
export class DailyDigestController {
  constructor(
    private readonly reportEngine: ReportEngineService,
    private readonly prisma: PrismaService,
  ) {}

  /** Get today's daily digest report. */
  @Get()
  @RequirePermissions('reports:read')
  async getDigest(@CurrentUser() user: any) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);

    const data = await this.reportEngine.generate('MIS_DAILY_DIGEST', {
      dateFrom: todayStart,
      dateTo: todayEnd,
      userId: user.id,
      tenantId: user.tenantId,
    });

    return ApiResponse.success(data, "Today's daily digest");
  }

  /** Configure daily digest email delivery (recipients, time, format). */
  @Put('settings')
  @RequirePermissions('reports:update')
  async updateSettings(
    @Body() dto: DailyDigestSettingsDto,
    @CurrentUser() user: any,
  ) {
    const digestDef = await this.prisma.working.reportDefinition.findFirst({
      where: { code: 'MIS_DAILY_DIGEST' },
    });

    // Upsert a ScheduledReport for the daily digest
    const existing = await this.prisma.working.scheduledReport.findFirst({
      where: {
        createdById: user.id,
        reportDef: { code: 'MIS_DAILY_DIGEST' },
      },
    });

    const nextScheduledAt = this.calculateNextDigestTime(dto.timeOfDay || '08:00');

    if (existing) {
      const updated = await this.prisma.working.scheduledReport.update({
        where: { id: existing.id },
        data: {
          recipientEmails: dto.recipientEmails,
          recipientUserIds: dto.recipientUserIds || [],
          timeOfDay: dto.timeOfDay || '08:00',
          format: (dto.format || 'PDF') as any,
          nextScheduledAt,
          status: 'ACTIVE',
        },
        include: { reportDef: true },
      });
      return ApiResponse.success(updated, 'Daily digest settings updated');
    }

    const reportDefId = digestDef?.id || '';

    const schedule = await this.prisma.working.scheduledReport.create({
      data: {
        reportDefId,
        name: 'Daily Digest',
        frequency: 'DAILY' as any,
        format: (dto.format || 'PDF') as any,
        recipientEmails: dto.recipientEmails,
        recipientUserIds: dto.recipientUserIds || [],
        timeOfDay: dto.timeOfDay || '08:00',
        nextScheduledAt,
        status: 'ACTIVE',
        createdById: user.id,
      },
      ...(digestDef ? { include: { reportDef: true } } : {}),
    });

    return ApiResponse.success(schedule, 'Daily digest schedule created');
  }

  /** Calculate next digest time based on HH:mm string. */
  private calculateNextDigestTime(timeOfDay: string): Date {
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= new Date()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
}
