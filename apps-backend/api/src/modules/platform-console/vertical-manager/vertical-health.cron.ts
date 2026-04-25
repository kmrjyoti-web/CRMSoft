import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { VerticalManagerService } from './vertical-manager.service';

@Injectable()
export class VerticalHealthCron {
  private readonly logger = new Logger(VerticalHealthCron.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly verticalManagerService: VerticalManagerService,
  ) {}

  @Cron('*/30 * * * *', { name: 'vertical-health-check', timeZone: 'Asia/Kolkata' })
  async handleHealthCheck() {
    try {
      const verticals = await this.db.verticalRegistry.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const vertical of verticals) {
        try {
          await this.verticalManagerService.checkVerticalHealth(vertical.code);
        } catch (error) {
          this.logger.error(`Health check failed for ${vertical.code}`, (error as Error).stack);
        }
      }

      this.logger.log(`Health check completed for ${verticals.length} active verticals`);
    } catch (error) {
      this.logger.error('Vertical health check cron failed', (error as Error).stack);
    }
  }

  @Cron('30 1 * * 0', { name: 'weekly-vertical-audit', timeZone: 'Asia/Kolkata' })
  async handleWeeklyAudit() {
    try {
      const verticals = await this.db.verticalRegistry.findMany();

      for (const vertical of verticals) {
        try {
          await this.verticalManagerService.runVerticalAudit(vertical.code);
        } catch (error) {
          this.logger.error(`Weekly audit failed for ${vertical.code}`, (error as Error).stack);
        }
      }

      this.logger.log(`Weekly audit completed for ${verticals.length} verticals`);
    } catch (error) {
      this.logger.error('Weekly vertical audit cron failed', (error as Error).stack);
    }
  }
}
