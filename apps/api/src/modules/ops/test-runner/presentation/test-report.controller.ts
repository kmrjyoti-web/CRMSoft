import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Controller('ops/test-report')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class TestReportController {
  constructor(
    private readonly errorAnalyzer: TestErrorAnalyzerService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /ops/test-report — List all generated reports */
  @Get()
  async listReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.platform.testReport.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { testRun: { select: { id: true, status: true, passed: true, failed: true, totalTests: true, createdAt: true } } },
      }),
      this.prisma.platform.testReport.count(),
    ]);
    return ApiResponse.success({ data, meta: { total, page, limit } });
  }

  /** GET /ops/test-report/:id — Full report detail */
  @Get(':id')
  async getReport(@Param('id', ParseUUIDPipe) id: string) {
    const report = await this.prisma.platform.testReport.findUnique({
      where: { id },
      include: { testRun: true },
    });
    return ApiResponse.success(report);
  }

  /** POST /ops/test-report/generate/:testRunId — Generate report for a run */
  @Post('generate/:testRunId')
  async generateReport(@Param('testRunId', ParseUUIDPipe) testRunId: string) {
    const reportId = await this.errorAnalyzer.generateReport(testRunId);
    return ApiResponse.success({ reportId });
  }
}
