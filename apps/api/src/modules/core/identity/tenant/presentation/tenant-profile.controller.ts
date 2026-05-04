import {
  Controller, Get, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { TenantProfileService } from '../services/tenant-profile.service';
import { TenantActivityService } from '../services/tenant-activity.service';
import { UpsertTenantProfileDto } from './dto/upsert-tenant-profile.dto';
import { TenantActivityQueryDto } from './dto/tenant-activity-query.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Tenant Profile')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/tenant-profiles')
export class TenantProfileController {
  constructor(
    private readonly tenantProfileService: TenantProfileService,
    private readonly tenantActivityService: TenantActivityService,
  ) {}

  @Get(':tenantId/profile')
  @ApiOperation({ summary: 'Get tenant profile by tenant ID' })
  async getProfile(@Param('tenantId') tenantId: string) {
    const profile = await this.tenantProfileService.getByTenantId(tenantId);
    return ApiResponse.success(profile);
  }

  @Put(':tenantId/profile')
  @ApiOperation({ summary: 'Create or update tenant profile' })
  async upsertProfile(
    @Param('tenantId') tenantId: string,
    @Body() body: UpsertTenantProfileDto,
  ) {
    const profile = await this.tenantProfileService.upsert(tenantId, body);
    return ApiResponse.success(profile, 'Tenant profile updated');
  }

  @Get(':tenantId/activity')
  @ApiOperation({ summary: 'Get tenant activity logs (paginated)' })
  async getActivity(
    @Param('tenantId') tenantId: string,
    @Query() query: TenantActivityQueryDto,
  ) {
    const result = await this.tenantActivityService.getByTenant(tenantId, {
      category: query.category,
      page: query.page,
      limit: query.limit,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
