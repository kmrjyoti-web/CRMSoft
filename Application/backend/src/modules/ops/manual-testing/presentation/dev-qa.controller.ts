import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DevQANotionService } from '../services/dev-qa-notion.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Controller('ops/dev-qa')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class DevQAController {
  constructor(
    private readonly devQAService: DevQANotionService,
    private readonly prisma: PrismaService,
  ) {}

  /** POST /ops/dev-qa/generate-plan — Auto-generate test plan from modules */
  @Post('generate-plan')
  async generatePlan(
    @CurrentUser() user: any,
    @Body('name') name: string,
    @Body('modules') modules?: string[],
  ) {
    const result = await this.devQAService.generateModuleTestPlan(
      name ?? `Dev QA Plan — ${new Date().toLocaleDateString()}`,
      modules,
      user.id,
      user.tenantId,
    );
    return ApiResponse.success(result);
  }

  /** POST /ops/dev-qa/:planId/sync-notion — Push plan to Notion */
  @Post(':planId/sync-notion')
  async syncToNotion(
    @Param('planId', ParseUUIDPipe) planId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.devQAService.syncToNotion(planId, user.tenantId);
    return ApiResponse.success(result);
  }

  /** POST /ops/dev-qa/:planId/pull-notion — Pull updates from Notion */
  @Post(':planId/pull-notion')
  async pullFromNotion(
    @Param('planId', ParseUUIDPipe) planId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.devQAService.pullFromNotion(planId, user.tenantId);
    return ApiResponse.success(result);
  }

  /** GET /ops/dev-qa/dashboard — Dev QA stats overview */
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    const [plans, totalItems, passedItems, failedItems] = await Promise.all([
      this.prisma.platform.testPlan.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true, name: true, status: true, progress: true, totalItems: true, passedItems: true, failedItems: true, notionSyncedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId } } }),
      this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId }, status: 'PASSED' } }),
      this.prisma.platform.testPlanItem.count({ where: { plan: { tenantId: user.tenantId }, status: 'FAILED' } }),
    ]);

    return ApiResponse.success({
      plans,
      stats: {
        totalItems,
        passedItems,
        failedItems,
        notStarted: totalItems - passedItems - failedItems,
        overallPassRate: totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0,
      },
    });
  }

  /** GET /ops/dev-qa/plans — List dev QA plans */
  @Get('plans')
  async listPlans(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.platform.testPlan.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, description: true, status: true, progress: true,
          totalItems: true, passedItems: true, failedItems: true,
          notionPageId: true, notionSyncedAt: true, createdAt: true,
        },
      }),
      this.prisma.platform.testPlan.count({ where: { tenantId: user.tenantId } }),
    ]);
    return ApiResponse.success({ data, meta: { total, page, limit } });
  }
}
