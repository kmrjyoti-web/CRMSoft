import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/tenants')
export class VendorTenantsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List tenants with pagination' })
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant detail' })
  async getById(@Param('id') id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        profile: true,
      },
    });
    return ApiResponse.success(tenant);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a tenant' })
  async suspend(@Param('id') id: string) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
    return ApiResponse.success(tenant, 'Tenant suspended');
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a tenant' })
  async activate(@Param('id') id: string) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    return ApiResponse.success(tenant, 'Tenant activated');
  }

  @Post(':id/extend-trial')
  @ApiOperation({ summary: 'Extend tenant trial period (stub)' })
  async extendTrial(
    @Param('id') id: string,
    @Body() body: { days: number },
  ) {
    // trialEndsAt is not on the Tenant model yet — stub response
    return ApiResponse.success(
      { tenantId: id, daysExtended: body.days ?? 0 },
      'Trial extension recorded (stub)',
    );
  }
}
