import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { VendorTenantsService } from '../services/vendor-tenants.service';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Vendor Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/tenants')
export class VendorTenantsController {
  constructor(private readonly vendorTenantsService: VendorTenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List tenants with pagination. Filter by parentTenantId to get WL child tenants.' })
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('parentTenantId') parentTenantId?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const { data, total } = await this.vendorTenantsService.list({ status, page: p, limit: l, parentTenantId });
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant detail' })
  async getById(@Param('id') id: string) {
    return ApiResponse.success(await this.vendorTenantsService.getById(id));
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a tenant' })
  async suspend(@Param('id') id: string) {
    return ApiResponse.success(await this.vendorTenantsService.suspend(id), 'Tenant suspended');
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a tenant' })
  async activate(@Param('id') id: string) {
    return ApiResponse.success(await this.vendorTenantsService.activate(id), 'Tenant activated');
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
