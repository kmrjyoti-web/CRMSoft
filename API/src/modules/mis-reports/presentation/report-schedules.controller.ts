import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

/**
 * Controller for managing scheduled report generation.
 * Supports CRUD operations for report schedules that automatically
 * generate and email reports at configured intervals.
 */
@Controller('mis-reports/schedules')
@UseGuards(AuthGuard('jwt'))
export class ReportSchedulesController {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a new scheduled report for the current user. */
  @Post()
  @RequirePermissions('reports:create')
  async create(@Body() dto: CreateScheduleDto, @CurrentUser('id') userId: string) {
    const reportDef = await this.prisma.reportDefinition.findFirst({
      where: { code: dto.reportCode },
    });
    if (!reportDef) {
      throw new NotFoundException(`Report definition not found: ${dto.reportCode}`);
    }

    const nextScheduledAt = this.calculateNextScheduledAt(
      dto.frequency, dto.dayOfWeek, dto.dayOfMonth, dto.timeOfDay || '08:00',
    );

    const schedule = await this.prisma.scheduledReport.create({
      data: {
        reportDefId: reportDef.id,
        name: dto.name,
        frequency: dto.frequency as any,
        format: dto.format as any,
        filters: dto.filters ?? undefined,
        recipientEmails: dto.recipientEmails,
        dayOfWeek: dto.dayOfWeek,
        dayOfMonth: dto.dayOfMonth,
        timeOfDay: dto.timeOfDay || '08:00',
        nextScheduledAt,
        status: 'ACTIVE',
        createdById: userId,
      },
      include: { reportDef: true },
    });
    return ApiResponse.success(schedule, 'Scheduled report created');
  }

  /** List all scheduled reports created by the current user. */
  @Get()
  @RequirePermissions('reports:read')
  async list(@CurrentUser('id') userId: string) {
    const schedules = await this.prisma.scheduledReport.findMany({
      where: { createdById: userId },
      include: { reportDef: true },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(schedules, 'Scheduled reports retrieved');
  }

  /** Get detailed information for a single scheduled report. */
  @Get(':id')
  @RequirePermissions('reports:read')
  async getById(@Param('id') id: string) {
    const schedule = await this.prisma.scheduledReport.findFirst({
      where: { id }, include: { reportDef: true },
    });
    if (!schedule) throw new NotFoundException('Scheduled report not found');
    return ApiResponse.success(schedule, 'Scheduled report retrieved');
  }

  /** Update an existing scheduled report. Recalculates nextScheduledAt if frequency changes. */
  @Patch(':id')
  @RequirePermissions('reports:update')
  async update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    const existing = await this.prisma.scheduledReport.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Scheduled report not found');

    const data: any = { ...dto };
    delete data.reportCode;

    const frequencyChanged = dto.frequency !== undefined
      || dto.dayOfWeek !== undefined || dto.dayOfMonth !== undefined
      || dto.timeOfDay !== undefined;

    if (frequencyChanged) {
      data.nextScheduledAt = this.calculateNextScheduledAt(
        dto.frequency || existing.frequency,
        dto.dayOfWeek ?? existing.dayOfWeek ?? undefined,
        dto.dayOfMonth ?? existing.dayOfMonth ?? undefined,
        dto.timeOfDay || existing.timeOfDay || '08:00',
      );
    }

    const updated = await this.prisma.scheduledReport.update({
      where: { id }, data, include: { reportDef: true },
    });
    return ApiResponse.success(updated, 'Scheduled report updated');
  }

  /** Cancel a scheduled report by setting its status to CANCELLED. */
  @Delete(':id')
  @RequirePermissions('reports:delete')
  async remove(@Param('id') id: string) {
    const existing = await this.prisma.scheduledReport.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Scheduled report not found');

    const cancelled = await this.prisma.scheduledReport.update({
      where: { id }, data: { status: 'CANCELLED' },
    });
    return ApiResponse.success(cancelled, 'Scheduled report cancelled');
  }

  /**
   * Calculate the next scheduled execution time based on frequency settings.
   * @param frequency - DAILY, WEEKLY, MONTHLY, QUARTERLY, or YEARLY
   * @param dayOfWeek - Day of week for WEEKLY (0=Sun, 6=Sat)
   * @param dayOfMonth - Day of month for MONTHLY/QUARTERLY/YEARLY (1-31)
   * @param timeOfDay - Time in HH:mm format
   * @returns The next scheduled Date
   */
  private calculateNextScheduledAt(
    frequency: string, dayOfWeek?: number,
    dayOfMonth?: number, timeOfDay = '08:00',
  ): Date {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    switch (frequency) {
      case 'DAILY': break;
      case 'WEEKLY':
        if (dayOfWeek !== undefined) {
          const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
          next.setDate(next.getDate() + daysUntil);
        }
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(dayOfMonth || 1, 28));
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        next.setDate(Math.min(dayOfMonth || 1, 28));
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        next.setDate(Math.min(dayOfMonth || 1, 28));
        break;
    }
    return next;
  }
}
