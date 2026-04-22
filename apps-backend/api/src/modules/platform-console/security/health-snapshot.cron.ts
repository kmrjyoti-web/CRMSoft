import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { SecurityService } from './security.service';

@Injectable()
export class HealthSnapshotCron {
  private readonly logger = new Logger(HealthSnapshotCron.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly securityService: SecurityService,
  ) {}

  @Cron('*/5 * * * *', { name: 'health-snapshot', timeZone: 'Asia/Kolkata' })
  async captureSnapshots() {
    try {
      const snapshots = await this.securityService.captureHealthSnapshot();

      for (const snapshot of snapshots) {
        if (snapshot.status === 'DOWN') {
          await this.securityService.createIncident({
            title: `Service DOWN: ${snapshot.service}`,
            severity: 'P1',
            description: `Service ${snapshot.service} is reporting DOWN status. Automatic incident created by health monitor.`,
            affectedService: snapshot.service,
          });
          this.logger.warn(`P1 incident created for DOWN service: ${snapshot.service}`);
        }

        if (snapshot.status === 'DEGRADED') {
          await this.db.alertHistory.create({
            data: {
              severity: 'WARNING',
              title: `Service DEGRADED: ${snapshot.service}`,
              message: `Service ${snapshot.service} is experiencing degraded performance. Response time: ${snapshot.responseTimeMs}ms`,
              channel: 'SYSTEM',
              delivered: true,
              createdAt: new Date(),
            },
          });
          this.logger.warn(`Alert created for DEGRADED service: ${snapshot.service}`);
        }
      }

      this.logger.log(`Health snapshot cron completed — ${snapshots.length} services checked`);
    } catch (error) {
      this.logger.error('Health snapshot cron failed', (error as any)?.stack || error);
    }
  }

  @Cron('30 18 * * *', { name: 'snapshot-cleanup', timeZone: 'Asia/Kolkata' })
  async cleanupOldSnapshots() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.db.healthSnapshot.deleteMany({
        where: { checkedAt: { lt: sevenDaysAgo } },
      });

      this.logger.log(`Snapshot cleanup: deleted ${result.count} records older than 7 days`);
    } catch (error) {
      this.logger.error('Snapshot cleanup cron failed', (error as any)?.stack || error);
    }
  }
}
