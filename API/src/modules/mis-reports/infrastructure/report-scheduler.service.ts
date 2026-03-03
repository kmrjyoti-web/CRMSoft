import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ReportEngineService } from './report-engine.service';
import { ReportEmailerService } from './report-emailer.service';

/** Maximum consecutive failures before pausing a scheduled report */
const MAX_CONSECUTIVE_FAILURES = 5;
/** Batch size for processing scheduled reports per cron tick */
const BATCH_SIZE = 10;
/** Number of days to retain exported report files */
const EXPORT_RETENTION_DAYS = 30;

/**
 * Cron-based scheduler that processes ScheduledReport entries.
 * Runs every minute, finds active reports whose nextScheduledAt has passed,
 * generates exports, emails them to recipients, and updates schedule state.
 */
@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: ReportEngineService,
    private readonly emailer: ReportEmailerService,
  ) {}

  /**
   * Process scheduled reports that are due.
   * Finds ACTIVE schedules where nextScheduledAt <= now,
   * generates exports, sends emails, and updates schedule metadata.
   * Called by cron-engine (PROCESS_SCHEDULED_REPORTS).
   */
  async processScheduledReports(): Promise<void> {
    const now = new Date();
    const dueReports = await this.prisma.scheduledReport.findMany({
      where: {
        status: 'ACTIVE',
        nextScheduledAt: { lte: now },
      },
      include: { reportDef: true },
      take: BATCH_SIZE,
      orderBy: { nextScheduledAt: 'asc' },
    });

    if (!dueReports.length) return;
    this.logger.log(`Processing ${dueReports.length} scheduled report(s)`);

    for (const schedule of dueReports) {
      await this.processOne(schedule);
    }
  }

  /**
   * Process a single scheduled report: generate, email, and update state.
   * On failure, records the error and pauses after MAX_CONSECUTIVE_FAILURES.
   * @param schedule - The ScheduledReport record with included reportDef
   */
  private async processOne(schedule: any): Promise<void> {
    const reportCode = schedule.reportDef?.code;
    if (!reportCode) {
      this.logger.warn(`Schedule ${schedule.id}: missing reportDef code, skipping`);
      return;
    }

    try {
      const dateTo = new Date();
      const dateFrom = this.getDateFrom(schedule.frequency, dateTo);
      const params = { dateFrom, dateTo, filters: schedule.filters || {} };

      const exportResult = await this.engine.export(
        reportCode, params, schedule.format,
        schedule.createdById, 'Scheduled', 'SCHEDULED',
      );

      const fileBuffer = require('fs').readFileSync(exportResult.fileUrl);
      await this.emailer.sendReport({
        recipients: schedule.recipientEmails || [],
        reportName: schedule.name,
        format: schedule.format,
        fileBuffer,
        fileName: exportResult.fileName,
      });

      const nextScheduledAt = this.calculateNextScheduledAt(
        schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth, schedule.timeOfDay,
      );

      await this.prisma.scheduledReport.update({
        where: { id: schedule.id },
        data: {
          lastSentAt: new Date(),
          nextScheduledAt,
          lastError: null,
          sendCount: { increment: 1 },
        },
      });

      this.logger.log(`Schedule ${schedule.id}: sent "${schedule.name}" successfully`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Schedule ${schedule.id} failed: ${errMsg}`);

      const updatedSchedule = await this.prisma.scheduledReport.update({
        where: { id: schedule.id },
        data: { lastError: errMsg },
      });

      await this.checkAndPauseIfNeeded(updatedSchedule);
    }
  }

  /**
   * Check if a schedule has too many consecutive failures and pause it.
   * @param schedule - Updated schedule record
   */
  private async checkAndPauseIfNeeded(schedule: any): Promise<void> {
    const recentLogs = await this.prisma.reportExportLog.findMany({
      where: { scheduledReportId: schedule.id, status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take: MAX_CONSECUTIVE_FAILURES,
    });

    if (recentLogs.length >= MAX_CONSECUTIVE_FAILURES) {
      await this.prisma.scheduledReport.update({
        where: { id: schedule.id },
        data: { status: 'PAUSED' },
      });
      this.logger.warn(`Schedule ${schedule.id} paused after ${MAX_CONSECUTIVE_FAILURES} failures`);
    }
  }

  /**
   * Calculate the next scheduled execution date based on frequency and timing.
   * @param frequency - Report frequency: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
   * @param dayOfWeek - Day of week for WEEKLY (0=Sunday, 6=Saturday)
   * @param dayOfMonth - Day of month for MONTHLY/QUARTERLY/YEARLY
   * @param timeOfDay - Time string in "HH:mm" format (default "08:00")
   * @returns Next scheduled Date
   */
  calculateNextScheduledAt(
    frequency: string,
    dayOfWeek?: number | null,
    dayOfMonth?: number | null,
    timeOfDay?: string | null,
  ): Date {
    const now = new Date();
    const [hours, minutes] = (timeOfDay || '08:00').split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 1);
        while (next.getDay() !== (dayOfWeek ?? 1)) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
        break;
      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /** Get the dateFrom for the reporting period based on frequency */
  private getDateFrom(frequency: string, dateTo: Date): Date {
    const from = new Date(dateTo);
    switch (frequency) {
      case 'DAILY': from.setDate(from.getDate() - 1); break;
      case 'WEEKLY': from.setDate(from.getDate() - 7); break;
      case 'MONTHLY': from.setMonth(from.getMonth() - 1); break;
      case 'QUARTERLY': from.setMonth(from.getMonth() - 3); break;
      case 'YEARLY': from.setFullYear(from.getFullYear() - 1); break;
      default: from.setDate(from.getDate() - 1);
    }
    return from;
  }

  /**
   * Send daily digest emails every day at 8 AM IST (2:30 AM UTC).
   * Finds all active daily digest schedules and triggers generation + delivery.
   * Called by cron-engine (SEND_DAILY_DIGEST).
   */
  async sendDailyDigest(): Promise<void> {
    this.logger.log('Running daily digest job (8 AM IST)');
    const digestSchedules = await this.prisma.scheduledReport.findMany({
      where: {
        status: 'ACTIVE',
        frequency: 'DAILY',
        reportDef: { code: 'MIS_DAILY_DIGEST' },
      },
      include: { reportDef: true },
    });

    if (!digestSchedules.length) {
      this.logger.log('No active daily digest schedules found');
      return;
    }

    for (const schedule of digestSchedules) {
      await this.processOne(schedule);
    }
  }

  /**
   * Clean up old exported report files every Sunday at 3 AM UTC.
   * Removes files older than EXPORT_RETENTION_DAYS from the tmp directory.
   * Called by cron-engine (CLEAN_OLD_EXPORTS).
   */
  async cleanOldExports(): Promise<void> {
    this.logger.log('Running weekly export cleanup');
    const exportDir = path.join(process.cwd(), 'tmp', 'mis-reports');

    if (!fs.existsSync(exportDir)) return;

    const cutoff = Date.now() - EXPORT_RETENTION_DAYS * 86400000;
    let cleaned = 0;

    try {
      const files = fs.readdirSync(exportDir);
      for (const file of files) {
        const filePath = path.join(exportDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
      this.logger.log(`Cleaned ${cleaned} old export files (older than ${EXPORT_RETENTION_DAYS} days)`);
    } catch (error) {
      this.logger.error(`Export cleanup failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  /** Get the number of days in the month of the given date */
  private daysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}
