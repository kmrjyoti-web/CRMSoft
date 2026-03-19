import {
  Controller, Get, Post, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { VendorTenantsService } from '../services/vendor-tenants.service';

@ApiTags('DB Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('admin/db')
export class VendorDbAdminController {
  constructor(private readonly vendorTenantsService: VendorTenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List tenants as databases' })
  async listDatabases(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const p = +page;
    const l = +limit;
    const { tenants, total } = await this.vendorTenantsService.listForDbAdmin(p, l);
    return ApiResponse.paginated(tenants, total, p, l);
  }

  @Post(':tenantId/migrate')
  @ApiOperation({ summary: 'Run migration for a tenant (stub)' })
  async migrate(@Param('tenantId') tenantId: string) {
    return ApiResponse.success(
      { tenantId, status: 'completed', message: 'Migration complete' },
    );
  }

  @Post(':tenantId/repair')
  @ApiOperation({ summary: 'Repair tenant database (stub)' })
  async repair(@Param('tenantId') tenantId: string) {
    return ApiResponse.success(
      { tenantId, status: 'completed', message: 'Repair complete' },
    );
  }

  @Post(':tenantId/backup')
  @ApiOperation({ summary: 'Initiate tenant database backup (stub)' })
  async backup(@Param('tenantId') tenantId: string) {
    return ApiResponse.success(
      { tenantId, url: '', message: 'Backup initiated' },
    );
  }
}
