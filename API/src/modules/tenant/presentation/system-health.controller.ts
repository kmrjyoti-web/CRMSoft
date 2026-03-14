import {
  Controller, Get, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { PrismaService } from '../../../core/prisma/prisma.service';

@ApiTags('System Health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/system-health')
export class SystemHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  async getHealth() {
    const start = Date.now();

    let dbOk = false;
    let dbTime = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbTime = Date.now() - dbStart;
      dbOk = true;
    } catch {
      dbTime = Date.now() - start;
    }

    const responseTimeMs = Date.now() - start;
    const mem = process.memoryUsage();
    const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

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
