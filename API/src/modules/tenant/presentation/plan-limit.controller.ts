import {
  Controller, Get, Put, Delete, Param, Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { PlanLimitService } from '../services/plan-limit.service';
import { UpsertPlanLimitsDto } from './dto/upsert-plan-limits.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Plan Limits Admin')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/plans')
export class PlanLimitController {
  constructor(private readonly planLimitService: PlanLimitService) {}

  @Get(':planId/limits')
  @ApiOperation({ summary: 'Get all limits for a plan' })
  async getLimits(@Param('planId') planId: string) {
    const limits = await this.planLimitService.getByPlan(planId);
    return ApiResponse.success(limits);
  }

  @Put(':planId/limits')
  @ApiOperation({ summary: 'Bulk upsert plan limits' })
  async upsertLimits(
    @Param('planId') planId: string,
    @Body() dto: UpsertPlanLimitsDto,
  ) {
    const limits = await this.planLimitService.upsertLimits(planId, dto.limits as any);
    return ApiResponse.success(limits, 'Plan limits updated');
  }

  @Delete(':planId/limits/:limitId')
  @ApiOperation({ summary: 'Delete a single plan limit' })
  async deleteLimit(
    @Param('planId') planId: string,
    @Param('limitId') limitId: string,
  ) {
    await this.planLimitService.deleteLimit(planId, limitId);
    return ApiResponse.success(null, 'Plan limit deleted');
  }
}
