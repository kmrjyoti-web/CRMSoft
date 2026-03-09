import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { VendorDashboardService } from '../services/vendor-dashboard.service';
import { VendorDashboardQueryDto } from './dto/vendor-dashboard-query.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Dashboard')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/vendor')
export class VendorDashboardController {
  constructor(
    private readonly vendorDashboardService: VendorDashboardService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get vendor dashboard overview metrics' })
  async getOverview(@Query() query: VendorDashboardQueryDto) {
    const data = await this.vendorDashboardService.getOverview(query.days);
    return ApiResponse.success(data);
  }

  @Get('dashboard/mrr')
  @ApiOperation({ summary: 'Get MRR trend over time' })
  async getMRR(@Query() query: VendorDashboardQueryDto) {
    const data = await this.vendorDashboardService.getMRR(query.days);
    return ApiResponse.success(data);
  }

  @Get('dashboard/growth')
  @ApiOperation({ summary: 'Get tenant growth over time' })
  async getTenantGrowth(@Query() query: VendorDashboardQueryDto) {
    const data = await this.vendorDashboardService.getTenantGrowth(query.days);
    return ApiResponse.success(data);
  }

  @Get('dashboard/plan-distribution')
  @ApiOperation({ summary: 'Get subscription distribution by plan' })
  async getPlanDistribution() {
    const data = await this.vendorDashboardService.getPlanDistribution();
    return ApiResponse.success(data);
  }

  @Get('dashboard/revenue-by-plan')
  @ApiOperation({ summary: 'Get revenue breakdown by plan' })
  async getRevenueByPlan(@Query() query: VendorDashboardQueryDto) {
    const data = await this.vendorDashboardService.getRevenueByPlan(query.days);
    return ApiResponse.success(data);
  }
}
