import {
  Controller, Get, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { SystemHealthService } from '../services/system-health.service';

@ApiTags('System Health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/system-health')
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  async getHealth() {
    const start = Date.now();
    const { ok: dbOk, latencyMs: dbTime } = await this.systemHealthService.checkDatabase();

    const responseTimeMs = Date.now() - start;

    return ApiResponse.success({
      api: {
        status: dbOk ? 'HEALTHY' : 'DEGRADED',
        uptime: process.uptime(),
        responseTimeMs,
        requestsPerMin: 0,
      },
      database: {
        status: dbOk ? 'HEALTHY' : 'DOWN',
        connectionPool: 0,
        queryTimeMs: dbTime,
      },
      redis: {
        status: 'DOWN' as const,
        memoryUsedMb: 0,
        connectedClients: 0,
      },
      queue: {
        status: 'DOWN' as const,
        pending: 0,
        active: 0,
        failed: 0,
        completed: 0,
      },
    });
  }

  @Get('metrics/:metric')
  @ApiOperation({ summary: 'Get specific system metric (stub)' })
  async getMetric(@Param('metric') metric: string) {
    return ApiResponse.success([]);
  }
}
