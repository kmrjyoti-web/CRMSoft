import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Controller('ops/test-error')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class TestErrorController {
  constructor(
    private readonly errorAnalyzer: TestErrorAnalyzerService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /ops/test-error/dashboard — Error analytics dashboard */
  @Get('dashboard')
  async getDashboard(
    @CurrentUser() user: any,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const data = await this.errorAnalyzer.getErrorDashboard(user?.tenantId ?? null, days);
    return ApiResponse.success(data);
  }

  /** GET /ops/test-error — List test errors with filters */
  @Get()
  async listErrors(
    @Query('testRunId') testRunId?: string,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
    @Query('isResolved') isResolved?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const where: Record<string, any> = {};
    if (testRunId) where.testRunId = testRunId;
    if (category) where.errorCategory = category;
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const [data, total] = await Promise.all([
      this.prisma.platform.testErrorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.platform.testErrorLog.count({ where }),
    ]);

    return ApiResponse.success({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  }

  /** GET /ops/test-error/:id — Error detail */
  @Get(':id')
  async getError(@Param('id', ParseUUIDPipe) id: string) {
    const error = await this.prisma.platform.testErrorLog.findUnique({
      where: { id },
      include: { testRun: { select: { id: true, status: true, createdAt: true } } },
    });
    return ApiResponse.success(error);
  }

  /** POST /ops/test-error/:id/report — Report to vendor */
  @Post(':id/report')
  async reportToVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('context') context?: string,
  ) {
    await this.errorAnalyzer.reportToVendor(id, context);
    return ApiResponse.success({ reported: true });
  }

  /** PATCH /ops/test-error/:id/resolve — Mark resolved */
  @Patch(':id/resolve')
  async resolveError(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body('resolution') resolution: string,
  ) {
    await this.errorAnalyzer.markResolved(id, user?.id ?? 'system', resolution ?? 'Resolved');
    return ApiResponse.success({ resolved: true });
  }

  /** POST /ops/test-error/generate/:testRunId — Generate errors from test run results */
  @Post('generate/:testRunId')
  async generateFromRun(@Param('testRunId', ParseUUIDPipe) testRunId: string) {
    const count = await this.errorAnalyzer.persistRunErrors(testRunId);
    return ApiResponse.success({ generated: count });
  }
}
