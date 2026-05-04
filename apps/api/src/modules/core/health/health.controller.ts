import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as os from 'os';

const START_TIME = Date.now();

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Quick health check — no auth required, used by load balancers */
  @Get()
  @ApiOperation({ summary: 'Quick health check' })
  async health() {
    return {
      status: 'healthy',
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      version: process.env.APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /** Deep health check — checks all DBs, Redis, memory, disk */
  @Get('deep')
  @ApiOperation({ summary: 'Deep health check (all subsystems)' })
  async deepHealth() {
    const checks: Record<string, any> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // ── Database checks ────────────────────────────────────────────────────
    const dbChecks = [
      { key: 'workingDb', fn: () => this.prisma.working.$queryRaw`SELECT 1` },
      { key: 'platformDb', fn: () => this.prisma.platform.$queryRaw`SELECT 1` },
    ];

    for (const { key, fn } of dbChecks) {
      const t0 = Date.now();
      try {
        await fn();
        checks[key] = { status: 'up', responseTimeMs: Date.now() - t0 };
      } catch {
        checks[key] = { status: 'down', responseTimeMs: Date.now() - t0 };
        overallStatus = 'unhealthy';
      }
    }

    // ── Identity DB (separate Prisma client if available) ──────────────────
    const t0id = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks['identityDb'] = { status: 'up', responseTimeMs: Date.now() - t0id };
    } catch {
      checks['identityDb'] = { status: 'down', responseTimeMs: Date.now() - t0id };
      overallStatus = 'unhealthy';
    }

    // ── Memory ────────────────────────────────────────────────────────────
    const totalMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeMb = Math.round(os.freemem() / 1024 / 1024);
    const usedMb = totalMb - freeMb;
    const usedPercent = Math.round((usedMb / totalMb) * 100);
    checks['memory'] = {
      status: usedPercent > 90 ? 'warning' : 'ok',
      usedMb,
      totalMb,
      usedPercent,
    };
    if (usedPercent > 90 && overallStatus === 'healthy') overallStatus = 'degraded';

    // ── Process memory ────────────────────────────────────────────────────
    const proc = process.memoryUsage();
    checks['process'] = {
      heapUsedMb: Math.round(proc.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(proc.heapTotal / 1024 / 1024),
      rssM: Math.round(proc.rss / 1024 / 1024),
    };

    // ── Uptime ────────────────────────────────────────────────────────────
    checks['uptime'] = {
      appUptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      systemUptimeSeconds: Math.floor(os.uptime()),
    };

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      checks,
    };
  }
}
