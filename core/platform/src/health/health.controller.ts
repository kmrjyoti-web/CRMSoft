import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as os from 'os';

export const HEALTH_DB_CHECKER = Symbol('HEALTH_DB_CHECKER');

export interface HealthDbChecker {
  checkDatabases(): Promise<Record<string, { status: 'up' | 'down'; responseTimeMs: number }>>;
}

const START_TIME = Date.now();

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Optional() @Inject(HEALTH_DB_CHECKER) private readonly dbChecker?: HealthDbChecker,
  ) {}

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

  /** Deep health check — checks all DBs, memory, disk */
  @Get('deep')
  @ApiOperation({ summary: 'Deep health check (all subsystems)' })
  async deepHealth() {
    const checks: Record<string, any> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // ── Database checks (delegated to provider if registered) ─────────────
    if (this.dbChecker) {
      const dbChecks = await this.dbChecker.checkDatabases();
      Object.assign(checks, dbChecks);
      const hasDown = Object.values(dbChecks).some((c) => c.status === 'down');
      if (hasDown) overallStatus = 'unhealthy';
    } else {
      checks['databases'] = { status: 'not-configured', note: 'Register HEALTH_DB_CHECKER provider to enable DB checks' };
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
      rssMb: Math.round(proc.rss / 1024 / 1024),
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
