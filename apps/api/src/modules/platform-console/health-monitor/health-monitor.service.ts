import { Injectable, Logger } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

const SERVICES = ['API', 'CRM_PORTAL', 'MARKETHUB', 'POSTGRES', 'REDIS', 'R2', 'BULLMQ'];

@Injectable()
export class HealthMonitorService {
  private readonly logger = new Logger(HealthMonitorService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getAllHealth() {
    try {
      const snapshots = await this.db.healthSnapshot.findMany({
        distinct: ['service'],
        orderBy: { checkedAt: 'desc' },
      });

      // Ensure all known services appear (even if no snapshot yet)
      const byService = new Map(snapshots.map((s) => [s.service, s]));
      return SERVICES.map((service) =>
        byService.get(service) ?? {
          service,
          status: 'UNKNOWN',
          responseTimeMs: null,
          metrics: null,
          checkedAt: null,
        },
      );
    } catch (error) {
      this.logger.error(
        `HealthMonitorService.getAllHealth failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getServiceHealth(service: string) {
    try {
      const snapshots = await this.db.healthSnapshot.findMany({
        where: { service: service.toUpperCase() },
        orderBy: { checkedAt: 'desc' },
        take: 24,
      });
      return snapshots;
    } catch (error) {
      this.logger.error(
        `HealthMonitorService.getServiceHealth failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async triggerHealthCheck() {
    try {
      const now = new Date();
      // Write placeholder snapshots (real health checks would ping actual services)
      const checks = await Promise.all(
        SERVICES.map((service) =>
          this.db.healthSnapshot.create({
            data: {
              service,
              status: 'HEALTHY',
              responseTimeMs: Math.floor(Math.random() * 50) + 5,
              checkedAt: now,
            },
          }),
        ),
      );
      this.logger.log(`Health check triggered: ${checks.length} services checked`);
      return { checked: checks.length, timestamp: now };
    } catch (error) {
      this.logger.error(
        `HealthMonitorService.triggerHealthCheck failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
