import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

/**
 * Manages auto-report rules and triggers notifications for error logs
 * based on severity thresholds and throttle windows.
 */
@Injectable()
export class ErrorAutoReportService {
  private readonly logger = new Logger('ErrorAutoReport');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check all matching rules for an error log and trigger notifications.
   * Called fire-and-forget after persisting an error log.
   */
  async checkAndReport(errorLog: Record<string, unknown>): Promise<void> {
    try {
      const rules = await this.prisma.platform.errorAutoReportRule.findMany({
        where: {
          severity: errorLog.severity as any,
          isActive: true,
          OR: [
            { tenantId: null },
            { tenantId: errorLog.tenantId as string },
          ],
        },
      });

      for (const rule of rules) {
