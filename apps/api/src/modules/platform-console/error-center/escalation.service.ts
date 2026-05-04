import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { ERROR_CENTER_ERRORS } from './error-center.errors';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async submitCustomerReport(dto: {
    brandId: string;
    tenantId?: string;
    reportedBy: string;
    title: string;
    description: string;
    errorCode?: string;
    screenshots?: string[];
    browserInfo?: Record<string, unknown>;
    lastActions?: string[];
  }) {
    try {
      const report = await this.db.customerErrorReport.create({
        data: {
          brandId: dto.brandId,
          tenantId: dto.tenantId,
          reportedBy: dto.reportedBy,
          title: dto.title,
          description: dto.description,
          errorCode: dto.errorCode,
          screenshots: dto.screenshots ?? [],
          browserInfo: (dto.browserInfo ?? {}) as any,
          lastActions: dto.lastActions ?? [],
          status: 'OPEN',
        },
      });

      // Auto-escalate if CRITICAL error code or high-severity pattern
      const isCritical =
        dto.errorCode?.startsWith('E_DB') ||
        dto.errorCode?.startsWith('E_CRITICAL');

      if (isCritical) {
        await this.autoEscalate(report.id, 'CRITICAL error code detected');
      }

      this.logger.log(
        `Customer error report ${report.id} submitted by ${dto.reportedBy}`,
      );
      return report;
    } catch (error) {
      this.logger.error(
        `EscalationService.submitCustomerReport failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async escalateToBrand(reportId: string): Promise<void> {
    try {
      const report = await this.db.customerErrorReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      if (report.status === 'RESOLVED') {
        throw new ConflictException(ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
      }
      await this.db.customerErrorReport.update({
        where: { id: reportId },
        data: { status: 'ACKNOWLEDGED', escalatedAt: new Date() },
      });
      this.logger.log(`Report ${reportId} escalated to brand (Level 2)`);
    } catch (error) {
      this.logger.error(
        `EscalationService.escalateToBrand failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async escalateToDeveloper(
    reportId: string,
    brandNotes: string,
  ): Promise<void> {
    try {
      const report = await this.db.customerErrorReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      if (report.status === 'RESOLVED') {
        throw new ConflictException(ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
      }

      // Find or create matching GlobalErrorLog
      let errorLogId: string | undefined;
      if (report.errorCode) {
        const log = await this.db.globalErrorLog.findFirst({
          where: { errorCode: report.errorCode, resolvedAt: null },
          orderBy: { createdAt: 'desc' },
        });
        errorLogId = log?.id;
      }

      // Create/update escalation record
      const existing = await this.db.errorEscalation.findFirst({
        where: errorLogId ? { errorLogId } : undefined,
      });

      if (!existing && errorLogId) {
        await this.db.errorEscalation.create({
          data: {
            errorLogId,
            level: 3,
            brandNotes,
            escalatedAt: new Date(),
          },
        });
      } else if (existing) {
        await this.db.errorEscalation.update({
          where: { id: existing.id },
          data: { level: 3, brandNotes, escalatedAt: new Date() },
        });
      }

      await this.db.customerErrorReport.update({
        where: { id: reportId },
        data: { status: 'ESCALATED' },
      });

      this.logger.log(`Report ${reportId} escalated to developer (Level 3)`);
    } catch (error) {
      this.logger.error(
        `EscalationService.escalateToDeveloper failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async resolveError(
    reportId: string,
    resolution: string,
    resolvedBy: string,
  ): Promise<void> {
    try {
      const report = await this.db.customerErrorReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      if (report.status === 'RESOLVED') {
        throw new ConflictException(ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
      }

      await this.db.customerErrorReport.update({
        where: { id: reportId },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });

      // Also resolve any linked GlobalErrorLog
      if (report.errorCode) {
        await this.db.globalErrorLog.updateMany({
          where: { errorCode: report.errorCode, resolvedAt: null },
          data: { resolvedAt: new Date(), resolvedBy, resolution },
        });
      }

      this.logger.log(
        `Report ${reportId} resolved by ${resolvedBy}: ${resolution}`,
      );
    } catch (error) {
      this.logger.error(
        `EscalationService.resolveError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async autoEscalate(reportId: string, reason: string): Promise<void> {
    try {
      await this.db.customerErrorReport.update({
        where: { id: reportId },
        data: { status: 'ESCALATED', escalatedAt: new Date() },
      });

      await this.db.errorAutoReport.create({
        data: {
          ruleCode: 'AUTO_CRITICAL',
          severity: 'CRITICAL',
          condition: reason,
          errorCode: 'AUTO',
          occurrences: 1,
          notifyChannel: 'EMAIL',
          acknowledged: false,
        },
      });

      this.logger.warn(`Auto-escalated report ${reportId}: ${reason}`);
    } catch (error) {
      this.logger.error(
        `EscalationService.autoEscalate failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async checkThresholdRules(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Find errorCodes appearing >= 3 times in last hour
      const grouped = await this.db.globalErrorLog.groupBy({
        by: ['errorCode'],
        _count: { id: true },
        where: { createdAt: { gte: oneHourAgo } },
        having: { id: { _count: { gte: 3 } } },
      });

      for (const row of grouped) {
        // Check if we already filed an auto-report for this in last hour
        const existing = await this.db.errorAutoReport.findFirst({
          where: {
            errorCode: row.errorCode,
            ruleCode: 'THRESHOLD_3X_1H',
            notifiedAt: { gte: oneHourAgo },
          },
        });

        if (!existing) {
          await this.db.errorAutoReport.create({
            data: {
              ruleCode: 'THRESHOLD_3X_1H',
              severity: 'HIGH',
              condition: `Same error code ${row.errorCode} appeared ${row._count.id} times in 1 hour`,
              errorCode: row.errorCode,
              occurrences: row._count.id,
              notifyChannel: 'EMAIL',
              acknowledged: false,
            },
          });
          this.logger.warn(
            `Auto-report: ${row.errorCode} occurred ${row._count.id}x in 1h`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `EscalationService.checkThresholdRules failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
