import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { PrismaService } from '../../../core/prisma/prisma.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('admin/audit-logs')
export class VendorAuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

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

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (category) where.category = category;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.tenantActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.tenantActivityLog.count({ where }),
    ]);

    return ApiResponse.paginated(data, total, p, l);
  }
}
