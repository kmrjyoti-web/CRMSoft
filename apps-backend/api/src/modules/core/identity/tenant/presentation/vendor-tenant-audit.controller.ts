import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { TenantAuditService } from '../services/tenant-audit.service';

@ApiTags('Vendor Tenant Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor')
export class VendorTenantAuditController {
  constructor(private readonly auditService: TenantAuditService) {}

  /* ------------------------------------------------------------------ */
  /*  Session lifecycle                                                 */
  /* ------------------------------------------------------------------ */

  @Post('tenants/:tenantId/audit/start')
  @ApiOperation({ summary: 'Start audit session on a tenant' })
  async startAudit(
    @Param('tenantId') tenantId: string,
    @Body() body: { reason: string; scheduledDays?: number },
    @Req() req: any,
  ) {
    const result = await this.auditService.startAudit(
      tenantId,
      req.user.id,
      req.user.name || req.user.email,
      body.reason,
      body.scheduledDays,
    );
    return ApiResponse.success(result);
  }

  @Post('tenants/:tenantId/audit/stop')
  @ApiOperation({ summary: 'Stop active audit session' })
  async stopAudit(@Param('tenantId') tenantId: string) {
    const result = await this.auditService.stopAudit(tenantId);
    return ApiResponse.success(result);
  }

  /* ------------------------------------------------------------------ */
  /*  Status & logs                                                     */
  /* ------------------------------------------------------------------ */

  @Get('tenants/:tenantId/audit')
  @ApiOperation({ summary: 'Get current audit status and stats' })
  async getAuditStatus(@Param('tenantId') tenantId: string) {
    const result = await this.auditService.getAuditStatus(tenantId);
    return ApiResponse.success(result);
  }

  @Get('tenants/:tenantId/audit/logs')
  @ApiOperation({ summary: 'Get audit activity logs (paginated)' })
  async getAuditLogs(
    @Param('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('actionType') actionType?: string,
    @Query('entityType') entityType?: string,
  ) {
    const session = await this.auditService.getAuditStatus(tenantId);
    if (!session) {
      return ApiResponse.success({
        data: [],
        meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
    }

    const result = await this.auditService.getAuditLogs(session.id, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      userId,
      actionType,
      entityType,
    });
    return ApiResponse.success(result);
  }

  /* ------------------------------------------------------------------ */
  /*  Reporting                                                         */
  /* ------------------------------------------------------------------ */

  @Get('tenants/:tenantId/audit/report')
  @ApiOperation({ summary: 'Generate audit summary report' })
  async getAuditReport(@Param('tenantId') tenantId: string) {
    const session = await this.auditService.getLatestSession(tenantId);
    if (!session) return ApiResponse.success(null);

    const result = await this.auditService.getAuditReport(session.id);
    return ApiResponse.success(result);
  }

  @Get('tenants/:tenantId/audit/history')
  @ApiOperation({ summary: 'Get past audit sessions' })
  async getAuditHistory(@Param('tenantId') tenantId: string) {
    const result = await this.auditService.getAuditHistory(tenantId);
    return ApiResponse.success(result);
  }

  /* ------------------------------------------------------------------ */
  /*  Cross-tenant overview                                             */
  /* ------------------------------------------------------------------ */

  @Get('audits')
  @ApiOperation({ summary: 'List all active audits across tenants' })
  async getAllActiveAudits() {
    const result = await this.auditService.getAllActiveAudits();
    return ApiResponse.success(result);
  }
}
