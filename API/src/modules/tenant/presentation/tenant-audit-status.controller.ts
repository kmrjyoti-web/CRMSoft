import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { TenantAuditService } from '../services/tenant-audit.service';

@ApiTags('Tenant Audit Status')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenant/audit-status')
export class TenantAuditStatusController {
  constructor(private readonly auditService: TenantAuditService) {}

  @Get()
  @ApiOperation({ summary: 'Check if current tenant is under audit' })
  async getAuditStatus(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return ApiResponse.success(null);

    const session = await this.auditService.getAuditStatus(tenantId);
    if (!session) return ApiResponse.success(null);

    return ApiResponse.success({
      isUnderAudit: true,
      reason: session.reason,
      startedAt: session.startedAt,
      startedByName: session.startedByName,
    });
  }
}
