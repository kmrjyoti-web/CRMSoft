import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { CreateTestRunCommand } from '../application/commands/create-test-run/create-test-run.command';
import { RerunFailedTestsCommand } from '../application/commands/rerun-failed-tests/rerun-failed-tests.command';
import { CancelTestRunCommand } from '../application/commands/cancel-test-run/cancel-test-run.command';
import { ListTestRunsQuery } from '../application/queries/list-test-runs/list-test-runs.query';
import { GetTestRunQuery } from '../application/queries/get-test-run/get-test-run.query';
import { GetTestResultsQuery } from '../application/queries/get-test-results/get-test-results.query';
import { GetTestResultsTreeQuery } from '../application/queries/get-test-results-tree/get-test-results-tree.query';
import { CompareTestRunsQuery } from '../application/queries/compare-test-runs/compare-test-runs.query';
import { GetTestDashboardQuery } from '../application/queries/get-test-dashboard/get-test-dashboard.query';

@Controller('ops/test-run')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class TestRunnerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** GET /ops/test-run/dashboard — Aggregated test statistics */
  @Get('dashboard')
  async getDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number = 30,
  ) {
    const data = await this.queryBus.execute(new GetTestDashboardQuery(tenantId, days));
    return ApiResponse.success(data);
  }

  /** POST /ops/test-run/auto — Start a full automated test run */
  @Post('auto')
  async runAutoTests(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTestRunDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateTestRunCommand(
        tenantId,
        userId,
        dto.testTypes ?? [],
        dto.targetModules ?? [],
        'AUTO',
        dto.testEnvId,
      ),
    );
    return ApiResponse.success(result, 'Test run queued');
  }

  /** POST /ops/test-run/selective — Run specific test types */
  @Post('selective')
  async runSelectiveTests(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTestRunDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateTestRunCommand(
        tenantId,
        userId,
        dto.testTypes ?? [],
        dto.targetModules ?? [],
        'MANUAL',
        dto.testEnvId,
      ),
    );
    return ApiResponse.success(result, 'Selective test run queued');
  }

  /** GET /ops/test-run — List test runs */
  @Get()
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const data = await this.queryBus.execute(new ListTestRunsQuery(tenantId, { status, page, limit }));
    return ApiResponse.success(data);
  }

  /** GET /ops/test-run/compare/:runId1/:runId2 — Diff two test runs */
  @Get('compare/:runId1/:runId2')
  async compareRuns(
    @Param('runId1', ParseUUIDPipe) runId1: string,
    @Param('runId2', ParseUUIDPipe) runId2: string,
  ) {
    const data = await this.queryBus.execute(new CompareTestRunsQuery(runId1, runId2));
    return ApiResponse.success(data);
  }

  /** GET /ops/test-run/:id — Get test run detail */
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.queryBus.execute(new GetTestRunQuery(id));
    return ApiResponse.success(data);
  }

  /** GET /ops/test-run/:id/results — Get detailed results */
  @Get(':id/results')
  async getResults(
    @Param('id', ParseUUIDPipe) testRunId: string,
    @Query('testType') testType?: string,
    @Query('status') status?: string,
    @Query('module') module?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ) {
    const data = await this.queryBus.execute(
      new GetTestResultsQuery(testRunId, { testType, status, module, page, limit }),
    );
    return ApiResponse.success(data);
  }

  /** GET /ops/test-run/:id/tree — Results grouped by suite (tree view) */
  @Get(':id/tree')
  async getResultsTree(@Param('id', ParseUUIDPipe) testRunId: string) {
    const data = await this.queryBus.execute(new GetTestResultsTreeQuery(testRunId));
    return ApiResponse.success(data);
  }

  /** POST /ops/test-run/:id/rerun-failed — Re-run only failed tests */
  @Post(':id/rerun-failed')
  async rerunFailed(
    @Param('id', ParseUUIDPipe) testRunId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new RerunFailedTestsCommand(tenantId, userId, testRunId),
    );
    return ApiResponse.success(result, 'Re-run of failed tests queued');
  }

  /** POST /ops/test-run/:id/cancel — Cancel a queued or running test run */
  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) testRunId: string) {
    const result = await this.commandBus.execute(new CancelTestRunCommand(testRunId));
    return ApiResponse.success(result, 'Test run cancelled');
  }
}
