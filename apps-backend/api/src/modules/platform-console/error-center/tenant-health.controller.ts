import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ErrorCenterService } from './error-center.service';

@ApiTags('Tenant')
@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantHealthController {
  constructor(private readonly errorCenter: ErrorCenterService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Simplified health status for the current tenant (customer-facing)',
    description: 'Returns HEALTHY / DEGRADED / DOWN based on error rate in last 24h. No raw error messages exposed.',
  })
  async getMyHealth(@Req() req: Request) {
    const tenantId: string | undefined = (req as any).user?.tenantId ?? (req as any)['tenant']?.id;
    if (!tenantId) {
      return { status: 'HEALTHY', errorCount24h: 0, lastErrorAt: null, criticalCount24h: 0 };
    }
    return this.errorCenter.getTenantHealthSummary(tenantId);
  }
}
