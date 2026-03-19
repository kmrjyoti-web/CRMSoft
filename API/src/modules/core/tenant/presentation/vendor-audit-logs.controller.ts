import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../../common/utils/api-response';
import { VendorAuditLogsService } from '../services/vendor-audit-logs.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('admin/audit-logs')
export class VendorAuditLogsController {
  constructor(private readonly vendorAuditLogsService: VendorAuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with pagination' })
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('tenantId') tenantId?: string,
    @Query('category') category?: string,
    @Query('action') action?: string,
  ) {
    const p = +page;
    const l = +limit;
    const { data, total } = await this.vendorAuditLogsService.list({ tenantId, category, action, page: p, limit: l });
    return ApiResponse.paginated(data, total, p, l);
  }
}
